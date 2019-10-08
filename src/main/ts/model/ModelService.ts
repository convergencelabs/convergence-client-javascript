import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {OperationTransformer} from "./ot/xform/OperationTransformer";
import {TransformationFunctionRegistry} from "./ot/xform/TransformationFunctionRegistry";
import {ClientConcurrencyControl} from "./ot/ClientConcurrencyControl";
import {Deferred} from "../util/Deferred";
import {ReplyCallback} from "../connection/ProtocolConnection";
import {ReferenceTransformer} from "./ot/xform/ReferenceTransformer";
import {ObjectValue} from "./dataValue";
import {DataValueFactory} from "./DataValueFactory";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util/";
import {RealTimeModel} from "./rt/";
import {HistoricalModel} from "./historical/";
import {ModelResult} from "./query/";
import {ModelPermissionManager} from "./ModelPermissionManager";
import {ICreateModelOptions} from "./ICreateModelOptions";
import {ModelDataCallback, ModelDataInitializer} from "./ModelDataInitializer";
import {IAutoCreateModelOptions} from "./IAutoCreateModelOptions";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {
  modelUserPermissionMapToProto,
  toIObjectValue,
  toModelPermissions,
  toModelResult,
  toObjectValue
} from "./ModelMessageConverter";
import IAutoCreateModelConfigRequestMessage = io.convergence.proto.IAutoCreateModelConfigRequestMessage;
import {
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  timestampToDate,
  toOptional
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {TypeChecker} from "../util/TypeChecker";
import {PagedData} from "../util/PagedData";
import { Validation } from "../util/Validation";

/**
 * This is the main entry point in Convergence for working with
 * [real time data models](https://docs.convergence.io/guide/models/overview.html).
 * Models can be created, opened, deleted, and managed from the [[ModelService]].
 *
 * @category Real Time Data Subsystem
 */
export class ModelService extends ConvergenceEventEmitter<IConvergenceEvent> {

  /**
   * @internal
   */
  private _openRequestsByModelId: Map<string, Deferred<RealTimeModel>> = new Map();

  /**
   * @internal
   */
  private _openModelsByModelId: Map<string, RealTimeModel> = new Map();

  /**
   * @internal
   */
  private _openModelsByRid: Map<string, RealTimeModel> = new Map();

  /**
   * @internal
   */
  private _autoRequestId: number;

  /**
   * @internal
   */
  private _autoCreateRequests: { [key: number]: IAutoCreateModelOptions } = {};

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._connection
      .messages()
      .subscribe(message => this._handleMessage(message));
    this._autoRequestId = 0;

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED, this._setOnline);
  }

  /**
   * @returns
   *  The ConvergenceSession attached to this domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Searches for models using the model [query syntax](https://docs.convergence.io/guide/models/queries.html).
   * Only `SELECT`s are currently supported.  The grammar is as follows:
   *
   * ```
   * SELECT [ * ]
   * [ FROM <Collection> ]
   * [ WHERE <Condition>* ]
   * [ ORDER BY (<Field> [ ASC|DESC ])* ]
   * [ LIMIT <MaxRecords> ]
   * [ OFFSET <SkipRecords> ]
   * ```
   *
   * @param query
   *   The query string to use to look up the model.
   *
   * @returns
   *   A promise that will be resolved with the query results.
   */
  public query(query: string): Promise<PagedData<ModelResult>> {
    Validation.assertNonEmptyString(query, "query");
    const request: IConvergenceMessage = {
      modelsQueryRequest: {
        query
      }
    };

    return this._connection
      .request(request)
      .then((response: IConvergenceMessage) => {
        const {modelsQueryResponse} = response;
        const data = getOrDefaultArray(modelsQueryResponse.models).map(toModelResult);
        const offset = getOrDefaultNumber(modelsQueryResponse.offset);
        const totalResults = getOrDefaultNumber(modelsQueryResponse.totalResults);
        return new PagedData<ModelResult>(data, offset, totalResults);
      });
  }

  /**
   * Determines if a model with the specified id is opened.
   *
   * @param id
   *   The id of the model to check.
   *
   * @returns
   *   True if the model is open, false otherwise.
   */
  public isOpen(id: string): boolean {
    Validation.assertNonEmptyString(id, "id");
    return this._openModelsByModelId.has(id);
  }

  /**
   * Determines if a model with the specified ID is currently in the process
   * of being opened.
   *
   * @param id
   *   The id of the model to check.
   *
   * @returns
   *   True if the model is opening, false otherwise.
   */
  public isOpening(id: string): boolean {
    Validation.assertNonEmptyString(id, "id");
    return this._openRequestsByModelId.has(id);
  }

  /**
   * Opens an existing model with a known model id. A model with the specified
   * id must already exist in the system.
   *
   * *Don't forget to [[RealTimeModel.close]] the model when you're done with it
   * to avoid memory leaks!*
   *
   * @param id
   *   The id of the model to open.
   *
   * @returns
   *   A promise that is resolved with the specified model, once open.
   */
  public open(id: string): Promise<RealTimeModel> {
    Validation.assertNonEmptyString(id, "id");
    return this._open(id);
  }

  /**
   * Opens a model, creating it if needed. If the model already exists, it will
   * be opened. If the model does not exist it will be created first, and then
   * opened.
   *
   * [See here](https://docs.convergence.io/guide/models/model-service.html#note-about-race-conditions)
   * for more context about race conditions this alleviates.
   *
   * @param options
   *   The options that define how to open and / or create the model.
   *
   * @returns
   *   A Promise resolved with the RealTimeModel, once opened.
   */
  public openAutoCreate(options: IAutoCreateModelOptions): Promise<RealTimeModel> {
    if (Validation.isNotSet(options)) {
      throw new ConvergenceError("'options' is a required parameter");
    }

    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<RealTimeModel>(new Error("options.collection must be a non-null, non empty string."));
    }

    return this._open(undefined, options);
  }

  /**
   * Creates a new model according to the options provided.  If a model with
   * the given ID already exists, this will return a rejected Promise.
   *
   * @param options
   *   A options object specifying how the model is to be created.
   *
   * @returns
   *   A Promise that is resolved with the id of the created model.
   */
  public create(options: ICreateModelOptions): Promise<string> {
    if (Validation.isNotSet(options)) {
      throw new ConvergenceError("'options' is a required parameter");
    }

    const collection = options.collection;
    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<string>(new Error("options.collection must be a non-null, non empty string."));
    }

    const data = (TypeChecker.isNull(options.data) || TypeChecker.isUndefined(options.data)) ?
      {} :
      {...options.data};

    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return idGen.id();
    });
    const dataValue: ObjectValue = dataValueFactory.createDataValue(data) as ObjectValue;

    const userPermissions = modelUserPermissionMapToProto(options.userPermissions);
    const request: IConvergenceMessage = {
      createRealTimeModelRequest: {
        collectionId: collection,
        modelId: toOptional(options.id),
        data: toIObjectValue(dataValue),
        overrideWorldPermissions: options.overrideCollectionWorldPermissions,
        worldPermissions: options.worldPermissions,
        userPermissions
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {createRealTimeModelResponse} = response;
      return createRealTimeModelResponse.modelId;
    });
  }

  /**
   * Removes an existing model by id.
   *
   * @param id
   *   The id of the model to remove.
   *
   * @returns
   *   A Promise that is resolved when the model is successfuly removed.
   */
  public remove(id: string): Promise<void> {
    Validation.assertNonEmptyString(id, "id");

    const request: IConvergenceMessage = {
      deleteRealtimeModelRequest: {
        modelId: id
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  /**
   * Opens an existing model, by id, in [history mode](https://docs.convergence.io/guide/models/history.html).
   *
   * @param id
   *   The id of the model to open in history mode.
   *
   * @returns
   *   A Promise resolved with the [[HistoricalModel]] when opened.
   */
  public history(id: string): Promise<HistoricalModel> {
    Validation.assertNonEmptyString(id, "id");

    const request: IConvergenceMessage = {
      historicalDataRequest: {
        modelId: id
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {historicalDataResponse} = response;
      return new HistoricalModel(
        toObjectValue(historicalDataResponse.data),
        getOrDefaultNumber(historicalDataResponse.version),
        timestampToDate(historicalDataResponse.modifiedTime),
        timestampToDate(historicalDataResponse.createdTime),
        id,
        historicalDataResponse.collectionId,
        this._connection,
        this.session(),
        this._identityCache);
    });
  }

  /**
   * Gets the permissions manager for a specific model, by id. The permissions
   * manager will allow the caller to set the model permissions for the
   * specified model.
   *
   * @param id
   *   The id of an existing model to get the permissions manager for.
   *
   * @returns
   *   A permissions manager for the specified model.
   */
  public permissions(id: string): ModelPermissionManager {
    Validation.assertNonEmptyString(id, "id");
    return new ModelPermissionManager(id, this._connection);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _close(resourceId: string): void {
    if (this._openModelsByRid.has(resourceId)) {
      const model: RealTimeModel = this._openModelsByRid.get(resourceId);
      this._openModelsByRid.delete(resourceId);
      this._openModelsByModelId.delete(model.modelId());
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _resourceIdChanged(modelId: string, oldResourceId: string, newResourceId: string): void {
    if (this._openModelsByModelId.has(modelId)) {
      const model: RealTimeModel = this._openModelsByModelId.get(modelId);
      this._openModelsByRid.delete(oldResourceId);
      this._openModelsByRid.set(newResourceId, model);
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _dispose(): void {
    this._openModelsByModelId.forEach(model => model
      .close()
      .catch(err => console.error(err)));
  }

  /**
   * @hidden
   * @internal
   */
  private _open(id?: string, options?: IAutoCreateModelOptions): Promise<RealTimeModel> {
    if (id === undefined && options === undefined) {
      throw new Error("Internal error, id or options must be defined.");
    }

    // todo validate options, specifically the model initializer.

    if (id === undefined) {
      id = options.id;
    }

    // Opening by a known model id, and this model is already open.
    // return it.
    if (id && this._openModelsByModelId.has(id)) {
      return Promise.resolve(this._openModelsByModelId.get(id));
    }

    // Opening by a known model id and we are already opening it.
    // return the promise for the open request.
    if (id && this._openRequestsByModelId.has(id)) {
      return this._openRequestsByModelId.get(id).promise();
    }

    // At this point we know we don't have the model open, or are not
    // already opening it, possible because we are creating a new model with
    // an new id.

    const autoRequestId: number = options ? this._autoRequestId++ : undefined;
    if (options !== undefined) {
      this._autoCreateRequests[autoRequestId] = options;
    }

    const deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    // If we don't have an id 1) we can't have an initializer, and 2) we couldn't possibly
    // ask for this model again since we don't know what the id is until the promise returns.
    if (id !== undefined) {
      this._openRequestsByModelId.set(id, deferred);
    }

    const request: IConvergenceMessage = {
      openRealTimeModelRequest: {
        modelId: toOptional(id),
        autoCreateId: toOptional(autoRequestId)
      }
    };

    this._connection.request(request)
      .then((response: IConvergenceMessage) => {
        if (id !== undefined !== undefined && this._openRequestsByModelId.has(id)) {
          this._openRequestsByModelId.delete(id);
        }

        if (autoRequestId !== undefined) {
          delete this._autoCreateRequests[autoRequestId];
        }

        const {openRealTimeModelResponse} = response;

        const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
        const referenceTransformer: ReferenceTransformer =
          new ReferenceTransformer(new TransformationFunctionRegistry());
        const clientConcurrencyControl: ClientConcurrencyControl = new ClientConcurrencyControl(
          getOrDefaultNumber(openRealTimeModelResponse.version),
          transformer,
          referenceTransformer);
        const data = toObjectValue(openRealTimeModelResponse.data);
        const model: RealTimeModel = new RealTimeModel(
          openRealTimeModelResponse.resourceId,
          getOrDefaultString(openRealTimeModelResponse.valueIdPrefix),
          data,
          getOrDefaultArray(openRealTimeModelResponse.connectedClients),
          getOrDefaultArray(openRealTimeModelResponse.references),
          toModelPermissions(openRealTimeModelResponse.permissions),
          getOrDefaultNumber(openRealTimeModelResponse.version),
          timestampToDate(openRealTimeModelResponse.createdTime),
          timestampToDate(openRealTimeModelResponse.modifiedTime),
          openRealTimeModelResponse.modelId,
          openRealTimeModelResponse.collection,
          clientConcurrencyControl,
          this._connection,
          this._identityCache,
          this
        );

        this._openModelsByModelId.set(openRealTimeModelResponse.modelId, model);
        this._openModelsByRid.set(openRealTimeModelResponse.resourceId, model);

        deferred.resolve(model);
        return;
      })
      .catch((error: Error) => {
        if (id !== undefined !== undefined && this._openRequestsByModelId.has(id)) {
          this._openRequestsByModelId.delete(id);
        }

        if (autoRequestId !== undefined) {
          delete this._autoCreateRequests[autoRequestId];
        }

        deferred.reject(error);
        return;
      });

    return deferred.promise();
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;

    // todo this is a bit long winded, is there a more concise way?
    const resourceId: string =
      (message.remoteOperation && message.remoteOperation.resourceId) ||
      (message.operationAck && message.operationAck.resourceId) ||
      (message.remoteClientOpenedModel && message.remoteClientOpenedModel.resourceId) ||
      (message.remoteClientClosedModel && message.remoteClientClosedModel.resourceId) ||
      (message.referenceShared && message.referenceShared.resourceId) ||
      (message.referenceUnshared && message.referenceUnshared.resourceId) ||
      (message.referenceSet && message.referenceSet.resourceId) ||
      (message.referenceCleared && message.referenceCleared.resourceId) ||
      (message.modelReconnectComplete && message.modelReconnectComplete.resourceId);

    if (resourceId) {
      const model: RealTimeModel = this._openModelsByRid.get(resourceId);
      if (model !== undefined) {
        model._handleMessage(messageEvent);
      } else {
        // todo error.
      }
    } else if (message.modelAutoCreateConfigRequest) {
      this._handleModelDataRequest(
        message.modelAutoCreateConfigRequest,
        messageEvent.callback);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _handleModelDataRequest(request: IAutoCreateModelConfigRequestMessage, replyCallback: ReplyCallback): void {
    const autoCreateId = request.autoCreateId || 0;
    const options: IAutoCreateModelOptions = this._autoCreateRequests[autoCreateId];
    if (options === undefined) {
      const message = `Received a request for an auto create id that was not expected: ${autoCreateId}`;
      console.error(message);
      replyCallback.expectedError("unknown_model", message);
    } else {
      delete this._autoCreateRequests[autoCreateId];

      let data: ModelDataInitializer = options.data;
      if (TypeChecker.isFunction(data)) {
        data = (data as ModelDataCallback)();
      } else if (TypeChecker.isUndefined(data) || TypeChecker.isNull(data)) {
        data = {};
      }

      // This makes sure that what we have is actually an object now.
      data = {...data};

      let dataValue: ObjectValue;
      if (data !== undefined) {
        const idGen: InitialIdGenerator = new InitialIdGenerator();
        const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
          return idGen.id();
        });
        dataValue = dataValueFactory.createDataValue(data) as ObjectValue;
      }

      const userPermissions = modelUserPermissionMapToProto(options.userPermissions);
      const response: IConvergenceMessage = {
        modelAutoCreateConfigResponse: {
          data: toIObjectValue(dataValue),
          ephemeral: options.ephemeral,
          collection: options.collection,
          overridePermissions: options.overrideCollectionWorldPermissions,
          worldPermissions: options.worldPermissions,
          userPermissions
        }
      };
      replyCallback.reply(response);
    }
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    this._openModelsByModelId.forEach((model) => {
      model._setOnline();
    });
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._openModelsByModelId.forEach((model) => {
      model._setOffline();
    });
    this._openModelsByRid.clear();
  }
}

class InitialIdGenerator {
  private _prefix: string = "0";
  private _id: number = 0;

  public id(): string {
    return this._prefix + ":" + this._id++;
  }
}

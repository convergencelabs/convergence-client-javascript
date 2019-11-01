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
import {
  getModelMessageResourceId,
  modelUserPermissionMapToProto,
  toIObjectValue,
  toModelPermissions,
  toModelResult,
  toObjectValue
} from "./ModelMessageConverter";
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
import {Validation} from "../util/Validation";
import {StorageEngine} from "../storage/StorageEngine";
import {ModelOfflineManager} from "./ModelOfflineManager";
import {ModelDeletedEvent} from "./events/";
import {ModelPermissions} from "./ModelPermissions";
import {IModelState} from "../storage/api/IModelState";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";
import {IModelCreationData} from "../storage/api/IModelCreationData";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IAutoCreateModelConfigRequestMessage = io.convergence.proto.IAutoCreateModelConfigRequestMessage;
import IReferenceData = io.convergence.proto.IReferenceData;

/**
 * The complete list of events that could be emitted by the [[ModelService]].
 *
 * @module RealTimeData
 */
export interface ModelServiceEvents {
  /**
   * Emitted when a model is deleted. The actual event emitted is a [[ModelDeletedEvent]].
   *
   * @event [[ModelDeletedEvent]]
   */
  readonly MODEL_DELETED: string;
}

/**
 * @module RealTimeData
 */
export const ModelServiceEventConstants: ModelServiceEvents = {
  MODEL_DELETED: "deleted",
};
Object.freeze(ModelServiceEventConstants);

/**
 * This is the main entry point in Convergence for working with
 * [real time data models](https://docs.convergence.io/guide/models/overview.html).
 * [[RealTimeModel]]s can be created, opened, deleted, and managed from the [[ModelService]].
 *
 * See [[ModelServiceEvents]] for the events that may be emitted on this model.
 *
 * @module RealTimeData
 */
export class ModelService extends ConvergenceEventEmitter<IConvergenceEvent> {

  /**
   * A mapping of the events this model could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * modelService.on(ModelService.Events.MODEL_DELETED, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: ModelServiceEvents = ModelServiceEventConstants;

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
  private readonly _autoCreateRequests: Map<number, IAutoCreateModelOptions>;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  private readonly _modelOfflineManager: ModelOfflineManager;

  /**
   * @internal
   */
  private readonly _log: Logger;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache, storageEngine: StorageEngine) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._connection
      .messages()
      .subscribe(message => this._handleMessage(message));
    this._autoRequestId = 0;
    this._autoCreateRequests = new Map();

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED, this._setOnline);

    this._modelOfflineManager = new ModelOfflineManager(
      10 * 60 * 1000,
      100,
      storageEngine
    );

    this._log = Logging.logger("models");
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

    return this._create(dataValue, options);
  }

  /**
   *
   * @param dataValue
   * @param options
   * @hidden
   * @internal
   * @private
   */
  public _create(dataValue: ObjectValue, options: ICreateModelOptions): Promise<string> {
    const collection = options.collection;
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
      const model = this._openModelsByModelId[id];
      const deletedEvent: ModelDeletedEvent = {
        src: model,
        name: RealTimeModel.Events.DELETED,
        local: true,
      };
      this._emitEvent(deletedEvent);
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

    if (TypeChecker.isNotSet(id)) {
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
      this._autoCreateRequests.set(autoRequestId, options);
    }

    const deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    // If we don't have an id 1) we can't have an initializer, and 2) we couldn't possibly
    // ask for this model again since we don't know what the id is until the promise returns.
    if (id !== undefined) {
      this._openRequestsByModelId.set(id, deferred);
    }

    const open = this._connection.isOnline() ?
      this._openOnline(id, autoRequestId) :
      this._openOffline(id, autoRequestId);

    open.then(model => {
      // Todo this code id duplicated
      if (id !== undefined !== undefined && this._openRequestsByModelId.has(id)) {
        this._openRequestsByModelId.delete(id);
      }

      if (autoRequestId !== undefined) {
        this._autoCreateRequests.delete(autoRequestId);
      }

      this._openModelsByModelId.set(model.modelId(), model);
    }).catch((error: Error) => {
      if (id !== undefined !== undefined && this._openRequestsByModelId.has(id)) {
        this._openRequestsByModelId.delete(id);
      }

      if (autoRequestId !== undefined) {
        this._autoCreateRequests.delete(autoRequestId);
      }

      return Promise.reject(error);
    });

    deferred.resolveFromPromise(open);

    return deferred.promise();
  }

  /**
   * @hidden
   * @internal
   */
  private _openOnline(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    const request: IConvergenceMessage = {
      openRealTimeModelRequest: {
        modelId: toOptional(id),
        autoCreateId: toOptional(autoRequestId)
      }
    };

    return this._connection.request(request)
      .then((response: IConvergenceMessage) => {
        const {openRealTimeModelResponse} = response;
        const data = toObjectValue(openRealTimeModelResponse.data);
        const model = this._createModel(
          getOrDefaultString(openRealTimeModelResponse.resourceId),
          getOrDefaultString(openRealTimeModelResponse.modelId),
          getOrDefaultString(openRealTimeModelResponse.collection),
          false,
          getOrDefaultNumber(openRealTimeModelResponse.version),
          timestampToDate(openRealTimeModelResponse.createdTime),
          timestampToDate(openRealTimeModelResponse.modifiedTime),
          getOrDefaultString(openRealTimeModelResponse.valueIdPrefix),
          getOrDefaultArray(openRealTimeModelResponse.connectedClients),
          getOrDefaultArray(openRealTimeModelResponse.references),
          toModelPermissions(openRealTimeModelResponse.permissions),
          data
        );

        this._openModelsByRid.set(openRealTimeModelResponse.resourceId, model);
        return model;
      });
  }

  /**
   * @hidden
   * @internal
   */
  private _openOffline(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    if (TypeChecker.isUndefined(id)) {
      // todo we could generate an uuid just like the server.
      return Promise.reject(new Error("can not open an offline model without an id"));
    } else {
      return this._modelOfflineManager
        .getOfflineModelData(id)
        .then(modelState => {
          if (TypeChecker.isSet(modelState)) {
            const model = this._creteModelFromOfflineState(modelState);
            model._enableOffline();
            return Promise.resolve(model);
          } else if (this._autoCreateRequests.has(autoRequestId)) {
            const options = this._autoCreateRequests.get(autoRequestId);
            const model = this._createNewModelOffline(id, options);
            const snapshot = model._enableOffline();
            const creationData: IModelCreationData = {
              modelId: id,
              collection: options.collection,
              initialData: snapshot.model.data,
              overrideCollectionWorldPermissions: options.overrideCollectionWorldPermissions,
              worldPermissions: options.worldPermissions,
              userPermissions: options.userPermissions
            };
            return this._modelOfflineManager.createOfflineModel(creationData).then(() => model);
          } else {
            return Promise.reject(new Error("Model not available offline, and not auto create options were provided"));
          }
        });
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _creteModelFromOfflineState(state: IModelState): RealTimeModel {
    this._log.debug(`Opening model '${state.model.modelId}' from offline state`);

    // FIXME what should these be?
    const resourceId = "fake";
    const valueIdPrefix = "fake2";

    const model = this._createModel(
      resourceId,
      state.model.modelId,
      state.model.collection,
      state.model.local,
      state.model.version,
      state.model.createdTime,
      state.model.modifiedTime,
      valueIdPrefix,
      [],
      [],
      state.model.permissions,
      state.model.data
    );

    model._setOffline();
    model._rehydrateFromOfflineState(state.serverOperations, state.localOperations);

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _createNewModelOffline(id: string, options: IAutoCreateModelOptions): RealTimeModel {
    this._log.debug(`Creating new offline model model '${id}' using auto-create options.`);
    const dataValue = this._getDataFromAutoCreate(options);

    // FIXME what should these be?
    const resourceId = "fake";
    const valueIdPrefix = "fake2";
    const currentTime = new Date();
    const permissions = new ModelPermissions(true, true, true, true);
    const version = 1;
    const local = true;

    const model = this._createModel(
      resourceId,
      id,
      options.collection,
      local,
      version,
      currentTime,
      currentTime,
      valueIdPrefix,
      [],
      [],
      permissions,
      dataValue
    );

    model._setOffline();

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _createModel(
    resourceId: string,
    modelId: string,
    collection: string,
    local: boolean,
    version: number,
    createdTime: Date,
    modifiedTime: Date,
    valueIdPrefix: string,
    connectedClients: string[],
    references: IReferenceData[],
    permissions: ModelPermissions,
    data: ObjectValue): RealTimeModel {

    const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
    const referenceTransformer: ReferenceTransformer =
      new ReferenceTransformer(new TransformationFunctionRegistry());
    const clientConcurrencyControl: ClientConcurrencyControl =
      new ClientConcurrencyControl(
        () => this._connection.session().sessionId(),
        version,
        transformer,
        referenceTransformer);

    return new RealTimeModel(
      resourceId,
      valueIdPrefix,
      data,
      local,
      connectedClients,
      references,
      permissions,
      version,
      createdTime,
      modifiedTime,
      modelId,
      collection,
      clientConcurrencyControl,
      this._connection,
      this._identityCache,
      this,
      this._modelOfflineManager
    );
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;

    const resourceId: string = getModelMessageResourceId(message);

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

    if (!this._autoCreateRequests.has(autoCreateId)) {
      const message = `Received a request for an auto create id that was not expected: ${autoCreateId}`;
      console.error(message);
      replyCallback.expectedError("unknown_model", message);
    } else {
      const options: IAutoCreateModelOptions = this._autoCreateRequests.get(autoCreateId);
      this._autoCreateRequests.delete(autoCreateId);

      const dataValue: ObjectValue = this._getDataFromAutoCreate(options);

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

  private _getDataFromAutoCreate(options: IAutoCreateModelOptions): ObjectValue {
    let data: ModelDataInitializer = options.data;
    if (TypeChecker.isFunction(data)) {
      data = (data as ModelDataCallback)();
    } else if (TypeChecker.isNotSet(data)) {
      data = {};
    }

    // This makes sure that what we have is actually an object now.
    data = {...data};

    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return idGen.id();
    });
    return dataValueFactory.createDataValue(data) as ObjectValue;
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

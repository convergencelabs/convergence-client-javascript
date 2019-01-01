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
import {ConvergenceEventEmitter, IConvergenceEvent, Validation} from "../util/";
import {RealTimeModel} from "./rt/";
import {HistoricalModel} from "./historical/";
import {ModelResult} from "./query/";
import {ModelPermissionManager} from "./ModelPermissionManager";
import {ICreateModelOptions} from "./ICreateModelOptions";
import {ModelDataCallback, ModelDataInitializer} from "./ModelDataInitializer";
import {IAutoCreateModelOptions} from "./IAutoCreateModelOptions";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {toIObjectValue, toModelPermissions, toModelResult, toObjectValue} from "./ModelMessageConverter";
import IAutoCreateModelConfigRequestMessage = io.convergence.proto.IAutoCreateModelConfigRequestMessage;
import {timestampToDate, toOptional} from "../connection/ProtocolUtil";

/**
 * The [[ModelService]] is the main entry point in Convergence for working with
 * real time data models. Models can be created, opened, deleted, and managed
 * from the [[ModelService]].
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
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;
    this._connection
      .messages()
      .subscribe(message => this._handleMessage(message));
    this._autoRequestId = 0;
  }

  /**
   * @returns
   *  The ConvergenceSession object for this domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Searches for models using the Model Query Syntax.
   *
   * @param query
   *   The query string to use to look up the model.
   *
   * @returns
   *   A promise that will be resolved with the query results.
   */
  public query(query: string): Promise<ModelResult[]> {
    const request: IConvergenceMessage = {
      modelsQueryRequest: {
        query
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {modelsQueryResponse} = response;
      return modelsQueryResponse.models.map(toModelResult);
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
    return this._openModelsByModelId.has(id);
  }

  /**
   * Determines if a model with the specified id is being opened.
   *
   * @param id
   *   The id of the model to check.
   *
   * @returns
   *   True if the model is opening, false otherwise.
   */
  public isOpening(id: string): boolean {
    return this._openRequestsByModelId.has(id);
  }

  /**
   * Opens an existing model with a known model id. A model with the specified
   * id must already exist in the system.
   *
   * @param id
   *   The id of the model to open.
   *
   * @returns
   *   A promise that is resolved with the specified model, once open.
   */
  public open(id: string): Promise<RealTimeModel> {
    if (!Validation.nonEmptyString(id)) {
      return Promise.reject<RealTimeModel>(new Error("modelId must be a non-null, non empty string."));
    }

    return this._open(id);
  }

  /**
   * Opens a model, creating it if needed. If the model already exists, it will
   * be opened. If the model does not exist it will be created first, and then
   * opened.
   *
   * @param options
   *   The options that define how to open and / or create the model.
   *
   * @returns
   *   A Promise resolved with the RealTimeModel, once opened.
   */
  public openAutoCreate(options: IAutoCreateModelOptions): Promise<RealTimeModel> {
    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<RealTimeModel>(new Error("options.collection must be a non-null, non empty string."));
    }

    return this._open(undefined, options);
  }

  /**
   * Creates a new model according to the options provided.
   *
   * @param options
   *   A options object specifying how the model is to be created.
   *
   * @returns
   *   A Promise that is resolved with the id of the created model.
   */
  public create(options: ICreateModelOptions): Promise<string> {
    const collection = options.collection;
    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<string>(new Error("options.collection must be a non-null, non empty string."));
    }

    const data = options.data || {};

    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return idGen.id();
    });
    const dataValue: ObjectValue = dataValueFactory.createDataValue(data) as ObjectValue;
    const request: IConvergenceMessage = {
      createRealTimeModelRequest: {
        collectionId: collection,
        modelId: toOptional(options.id),
        data: toIObjectValue(dataValue),
        overrideWorldPermissions: options.overrideCollectionWorldPermissions,
        worldPermissions: options.worldPermissions,
        userPermissions: options.userPermissions
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
   * Opens an existing model, by id, in history mode.
   *
   * @param id
   *   The id of the model to open in history mode.
   *
   * @returns
   *   A Promise resolved with the HistoricalModel when opened.
   */
  public history(id: string): Promise<HistoricalModel> {
    const request: IConvergenceMessage = {
      historicalDataRequest: {
        modelId: id
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {historicalDataResponse} = response;
      return new HistoricalModel(
        toObjectValue(historicalDataResponse.data),
        historicalDataResponse.version as number,
        timestampToDate(historicalDataResponse.modifiedTime),
        timestampToDate(historicalDataResponse.createdTime),
        id,
        historicalDataResponse.collectionId,
        this._connection,
        this.session());
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

    const request: IConvergenceMessage = {
      openRealTimeModelRequest: {
        modelId: toOptional(id),
        autoCreateId: toOptional(autoRequestId)
      }
    };

    if (options !== undefined) {
      this._autoCreateRequests[autoRequestId] = options;
    }

    const deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    // If we don't have an id 1) we can't have an initializer, and 2) we couldn't possibly
    // ask for this model again since we don't know what the id is until the promise returns.
    if (id !== undefined) {
      this._openRequestsByModelId.set(id, deferred);
    }

    this._connection.request(request).then((response: IConvergenceMessage) => {
      const {openRealTimeModelResponse} = response;

      const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
      const referenceTransformer: ReferenceTransformer = new ReferenceTransformer(new TransformationFunctionRegistry());
      const clientConcurrencyControl: ClientConcurrencyControl = new ClientConcurrencyControl(
        this._connection.session().sessionId(),
        openRealTimeModelResponse.version as number,
        transformer,
        referenceTransformer);

      const model: RealTimeModel = new RealTimeModel(
        openRealTimeModelResponse.resourceId,
        openRealTimeModelResponse.valueIdPrefix,
        toObjectValue(openRealTimeModelResponse.data),
        openRealTimeModelResponse.connectedClients,
        openRealTimeModelResponse.references,
        toModelPermissions(openRealTimeModelResponse.permissions),
        openRealTimeModelResponse.version as number,
        timestampToDate(openRealTimeModelResponse.createdTime),
        timestampToDate(openRealTimeModelResponse.modifiedTime),
        openRealTimeModelResponse.modelId,
        openRealTimeModelResponse.collection,
        clientConcurrencyControl,
        this._connection,
        this
      );

      this._openModelsByModelId.set(openRealTimeModelResponse.modelId, model);
      this._openModelsByRid.set(openRealTimeModelResponse.resourceId, model);

      if (this._openRequestsByModelId.has(id)) {
        this._openRequestsByModelId.delete(id);
      }

      if (options !== undefined) {
        delete this._autoCreateRequests[autoRequestId];
      }

      deferred.resolve(model);
    }).catch((error: Error) => {
      deferred.reject(error);
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
      (message.referencePublished && message.referencePublished.resourceId) ||
      (message.referenceUnpublished && message.referenceUnpublished.resourceId) ||
      (message.referenceSet && message.referenceSet.resourceId) ||
      (message.referenceCleared && message.referenceCleared.resourceId);

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
    const options: IAutoCreateModelOptions = this._autoCreateRequests[request.autoCreateId];
    if (options === undefined) {
      const message = `Received a request for an auto create id that was not expected: ${request.autoCreateId}`;
      console.error(message);
      replyCallback.expectedError("unknown_model", message);
    } else {
      let data: ModelDataInitializer = options.data;
      if (typeof data === "function") {
        data = (data as ModelDataCallback)();
      }

      let dataValue: ObjectValue;
      if (data !== undefined) {
        const idGen: InitialIdGenerator = new InitialIdGenerator();
        const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
          return idGen.id();
        });
        dataValue = dataValueFactory.createDataValue(data) as ObjectValue;
      }

      const response: IConvergenceMessage = {
        modelAutoCreateConfigResponse: {
          data: toIObjectValue(dataValue),
          ephemeral: options.ephemeral,
          collection: options.collection,
          overridePermissions: options.overrideCollectionWorldPermissions,
          worldPermissions: options.worldPermissions,
          userPermissions: options.userPermissions
        }
      };
      replyCallback.reply(response);
    }
  }
}

class InitialIdGenerator {
  private _prefix: string = "0";
  private _id: number = 0;

  public id(): string {
    return this._prefix + ":" + this._id++;
  }
}

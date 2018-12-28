import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {OpenRealTimeModelRequest, OpenRealTimeModelResponse} from "../connection/protocol/model/openRealtimeModel";
import {MessageType} from "../connection/protocol/MessageType";
import {OperationTransformer} from "./ot/xform/OperationTransformer";
import {TransformationFunctionRegistry} from "./ot/xform/TransformationFunctionRegistry";
import {ClientConcurrencyControl} from "./ot/ClientConcurrencyControl";
import {
  CreateRealTimeModelRequest,
  CreateRealTimeModelResponse
} from "../connection/protocol/model/createRealtimeModel";
import {DeleteRealTimeModelRequest} from "../connection/protocol/model/deleteRealtimeModel";
import {Deferred} from "../util/Deferred";
import {
  AutoCreateModelConfigRequest,
  AutoCreateModelConfigResponse
} from "../connection/protocol/model/autoCreateConfigRequest";
import {ReplyCallback} from "../connection/ProtocolConnection";
import {ReferenceTransformer} from "./ot/xform/ReferenceTransformer";
import {ObjectValue} from "./dataValue";
import {DataValueFactory} from "./DataValueFactory";
import {ConvergenceEventEmitter, IConvergenceEvent, Validation} from "../util/";
import {RealTimeModel} from "./rt/";
import {HistoricalModel} from "./historical/";
import {
  HistoricalDataRequest,
  HistoricalDataResponse
} from "../connection/protocol/model/historical/historicalDataRequest";
import {ModelResult} from "./query/";
import {ModelsQueryRequest, ModelsQueryResponse} from "../connection/protocol/model/query/modelQuery";
import {ModelPermissionManager} from "./ModelPermissionManager";
import {ICreateModelOptions} from "./ICreateModelOptions";
import {ModelDataCallback, ModelDataInitializer} from "./ModelDataInitializer";
import {IAutoCreateModelOptions} from "./IAutoCreateModelOptions";

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
    this._connection.messages(
      [MessageType.FORCE_CLOSE_REAL_TIME_MODEL,
        MessageType.REMOTE_OPERATION,
        MessageType.OPERATION_ACKNOWLEDGEMENT,
        MessageType.MODEL_AUTO_CREATE_CONFIG_REQUEST,
        MessageType.REMOTE_CLIENT_OPENED,
        MessageType.REMOTE_CLIENT_CLOSED,
        MessageType.REFERENCE_PUBLISHED,
        MessageType.REFERENCE_UNPUBLISHED,
        MessageType.REFERENCE_SET,
        MessageType.REFERENCE_CLEARED])
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
    const message: ModelsQueryRequest = {type: MessageType.MODELS_QUERY_REQUEST, query};

    return this._connection.request(message).then((response: ModelsQueryResponse) => {
      return response.result;
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
    const request: CreateRealTimeModelRequest = {
      type: MessageType.CREATE_REAL_TIME_MODEL_REQUEST,
      collectionId: collection,
      modelId: options.id,
      data: dataValue,
      overrideWorld: options.overrideWorld,
      worldPermissions: options.worldPermissions,
      userPermissions: options.userPermissions
    };

    return this._connection.request(request).then((response: CreateRealTimeModelResponse) => {
      return response.modelId;
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
    const request: DeleteRealTimeModelRequest = {
      type: MessageType.DELETE_REAL_TIME_MODEL_REQUEST,
      modelId: id
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
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
    const request: HistoricalDataRequest = {
      type: MessageType.HISTORICAL_DATA_REQUEST,
      modelId: id
    };

    return this._connection.request(request).then((response: HistoricalDataResponse) => {
      return new HistoricalModel(
        response.data,
        response.version,
        response.modifiedTime,
        response.createdTime,
        id,
        response.collectionId,
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

    const request: OpenRealTimeModelRequest = {
      type: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      id,
      autoCreateId: autoRequestId
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

    this._connection.request(request).then((response: OpenRealTimeModelResponse) => {
      const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
      const referenceTransformer: ReferenceTransformer = new ReferenceTransformer(new TransformationFunctionRegistry());
      const clientConcurrencyControl: ClientConcurrencyControl = new ClientConcurrencyControl(
        this._connection.session().sessionId(),
        response.version,
        transformer,
        referenceTransformer);

      const model: RealTimeModel = new RealTimeModel(
        response.resourceId,
        response.valueIdPrefix,
        response.data,
        response.connectedClients,
        response.references,
        response.permissions,
        response.version,
        new Date(response.createdTime),
        new Date(response.modifiedTime),
        response.id,
        response.collection,
        clientConcurrencyControl,
        this._connection,
        this
      );

      this._openModelsByModelId.set(response.id, model);
      this._openModelsByRid.set(response.resourceId, model);

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
    switch (messageEvent.message.type) {
      case MessageType.MODEL_AUTO_CREATE_CONFIG_REQUEST:
        this._handleModelDataRequest(
          messageEvent.message as AutoCreateModelConfigRequest,
          messageEvent.callback);
        break;
      default:
        const model: RealTimeModel = this._openModelsByRid.get(messageEvent.message.resourceId);
        if (model !== undefined) {
          model._handleMessage(messageEvent);
        } else {
          // todo error.
        }
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _handleModelDataRequest(request: AutoCreateModelConfigRequest, replyCallback: ReplyCallback): void {
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

      const response: AutoCreateModelConfigResponse = {
        type: MessageType.MODEL_AUTO_CREATE_CONFIG_RESPONSE,
        data: dataValue,
        ephemeral: options.ephemeral,
        collection: options.collection,
        overrideWorld: options.overrideWorld,
        worldPermissions: options.worldPermissions,
        userPermissions: options.userPermissions,
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

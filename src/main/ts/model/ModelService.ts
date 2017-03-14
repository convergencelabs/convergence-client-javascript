import {Session} from "../Session";
import {ModelFqn} from "./ModelFqn";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {OpenRealTimeModelRequest} from "../connection/protocol/model/openRealtimeModel";
import {OpenRealTimeModelResponse} from "../connection/protocol/model/openRealtimeModel";
import {MessageType} from "../connection/protocol/MessageType";
import {OperationTransformer} from "./ot/xform/OperationTransformer";
import {TransformationFunctionRegistry} from "./ot/xform/TransformationFunctionRegistry";
import {ClientConcurrencyControl} from "./ot/ClientConcurrencyControl";
import {CreateRealTimeModelRequest} from "../connection/protocol/model/createRealtimeModel";
import {DeleteRealTimeModelRequest} from "../connection/protocol/model/deleteRealtimeModel";
import {Deferred} from "../util/Deferred";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {CloseRealTimeModelRequest} from "../connection/protocol/model/closeRealtimeModel";
import {ModelDataRequest} from "../connection/protocol/model/modelDataRequest";
import {ReplyCallback} from "../connection/ProtocolConnection";
import {ModelDataResponse} from "../connection/protocol/model/modelDataRequest";
import {ReferenceTransformer} from "./ot/xform/ReferenceTransformer";
import {ObjectValue} from "./dataValue";
import {DataValueFactory} from "./DataValueFactory";
import {Validation} from "../util/Validation";
import {RealTimeModel} from "./rt/RealTimeModel";
import {HistoricalModel} from "./historical/HistoricalModel";
import {HistoricalDataRequest} from "../connection/protocol/model/historical/historicalDataRequest";
import {HistoricalDataResponse} from "../connection/protocol/model/historical/historicalDataRequest";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ModelResult} from "./query/ModelResult";
import {ModelsQueryRequest, ModelsQueryResponse} from "../connection/protocol/model/query/modelQuery";
import {ModelPermissionService} from "./ModelPermissionService";

export class ModelService extends ConvergenceEventEmitter<ConvergenceEvent> {

  private _openRequestsByFqn: { [key: string]: OpenRequest; } = {};
  private _openModelsByFqn: { [key: string]: RealTimeModel; } = {};
  private _openModelsByRid: { [key: string]: RealTimeModel; } = {};

  constructor(private _connection: ConvergenceConnection) {
    super();
    this._connection.addMultipleMessageListener(
      [MessageType.FORCE_CLOSE_REAL_TIME_MODEL,
        MessageType.REMOTE_OPERATION,
        MessageType.OPERATION_ACKNOWLEDGEMENT,
        MessageType.MODEL_DATA_REQUEST,
        MessageType.REMOTE_CLIENT_OPENED,
        MessageType.REMOTE_CLIENT_CLOSED,
        MessageType.REFERENCE_PUBLISHED,
        MessageType.REFERENCE_UNPUBLISHED,
        MessageType.REFERENCE_SET,
        MessageType.REFERENCE_CLEARED],
      (message: MessageEvent) => this._handleMessage(message));
  }

  public session(): Session {
    return this._connection.session();
  }

  public query(query: string): Promise<ModelResult[]> {
    const message: ModelsQueryRequest = { type: MessageType.MODELS_QUERY_REQUEST, query };

    return this._connection.request(message).then((response: ModelsQueryResponse) => {
      return response.result;
    });
  }

  public open(collectionId: string, modelId: string, initializer?: () => any): Promise<RealTimeModel> {
    if (!Validation.nonEmptyString(collectionId)) {
      return Promise.reject<RealTimeModel>(new Error("collectionId must be a non-null, non empty string."));
    }

    if (!Validation.nonEmptyString(modelId)) {
      return Promise.reject<RealTimeModel>(new Error("modelId must be a non-null, non empty string."));
    }

    if (arguments.length > 2 && typeof initializer !== "function") {
      return Promise.reject<RealTimeModel>(new Error("initializer, supplied as an argument, must be a function."));
    }

    const fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    const k: string = fqn.hash();

    const openModel: RealTimeModel = this._openModelsByFqn[k];
    if (openModel !== undefined) {
      return Promise.resolve(openModel);
    }

    const openRequest: OpenRequest = this._openRequestsByFqn[k];
    if (openRequest !== undefined) {
      return openRequest.deferred.promise();
    }

    const request: OpenRealTimeModelRequest = {
      type: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      initializerProvided: initializer !== undefined
    };

    const deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

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
        response.version,
        new Date(response.createdTime),
        new Date(response.modifiedTime),
        fqn,
        clientConcurrencyControl,
        this._connection,
        this
      );

      this._openModelsByFqn[k] = model;
      this._openModelsByRid[response.resourceId] = model;
      delete this._openRequestsByFqn[k];

      deferred.resolve(model);
    }).catch((error: Error) => {
      deferred.reject(error);
    });

    this._openRequestsByFqn[k] = {
      deferred,
      initializer
    };

    return deferred.promise();
  }

  public create(collectionId: string, modelId: string, data: { [key: string]: any }): Promise<void> {
    const fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return idGen.id();
    });
    const dataValue: ObjectValue = <ObjectValue> dataValueFactory.createDataValue(data);
    const request: CreateRealTimeModelRequest = {
      type: MessageType.CREATE_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      data: dataValue
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  public remove(collectionId: string, modelId: string): Promise<void> {
    const fqn: ModelFqn = new ModelFqn(collectionId, modelId);

    const request: DeleteRealTimeModelRequest = {
      type: MessageType.DELETE_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  public history(collectionId: string, modelId: string): Promise<HistoricalModel> {
    const fqn: ModelFqn = new ModelFqn(collectionId, modelId);

    const request: HistoricalDataRequest = {
      type: MessageType.HISTORICAL_DATA_REQUEST,
      modelFqn: fqn
    };

    return this._connection.request(request).then((response: HistoricalDataResponse) => {
      return new HistoricalModel(response.data, response.version, response.modifiedTime, response.createdTime,
        request.modelFqn, this._connection, this.session());
    });
  }

  public permissions(collectionId: string, modelId: string): ModelPermissionService {
    return new ModelPermissionService(collectionId, modelId, this._connection);
  }

  public _close(resourceId: string): Promise<void> {
    const request: CloseRealTimeModelRequest = {
      type: MessageType.CLOSES_REAL_TIME_MODEL_REQUEST,
      resourceId
    };

    const model: RealTimeModel = this._openModelsByRid[resourceId];
    delete this._openModelsByRid[resourceId];

    const fqn: ModelFqn = new ModelFqn(model.collectionId(), model.modelId());
    const k: string = fqn.hash();

    delete this._openModelsByFqn[k];

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  public _dispose(): void {
    Object.getOwnPropertyNames(this._openModelsByFqn).forEach((fqn: string) => {
      this._openModelsByFqn[fqn].close();
    });
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.MODEL_DATA_REQUEST:
        this._handleModelDataRequest(
          <ModelDataRequest> messageEvent.message,
          messageEvent.callback);
        break;
      default:
        const model: RealTimeModel = this._openModelsByRid[messageEvent.message.resourceId];
        if (model !== undefined) {
          model._handleMessage(messageEvent);
        } else {
          // todo error.
        }
    }
  }

  private _handleModelDataRequest(request: ModelDataRequest, replyCallback: ReplyCallback): void {
    const fqn: ModelFqn = request.modelFqn;
    const openReq: OpenRequest = this._openRequestsByFqn[fqn.hash()];
    if (openReq === undefined) {
      replyCallback.expectedError("unknown_model", "the requested model is not being opened");
    } else if (openReq.initializer === undefined) {
      replyCallback.expectedError("no_initializer", "No initializer was provided when opening the model");
    } else {
      const data: any = openReq.initializer();
      const idGen: InitialIdGenerator = new InitialIdGenerator();
      const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
        return idGen.id();
      });
      const dataValue: ObjectValue = <ObjectValue> dataValueFactory.createDataValue(data);
      const response: ModelDataResponse = {
        data: dataValue,
        type: MessageType.MODEL_DATA_RESPONSE
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

interface OpenRequest {
  deferred: Deferred<RealTimeModel>;
  initializer: () => any;
}

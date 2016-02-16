import ConvergenceEventEmitter from "../util/ConvergenceEventEmitter";
import Session from "../Session";
import RealTimeModel from "./RealTimeModel";
import ModelFqn from "./ModelFqn";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import {OpenRealTimeModelRequest} from "../connection/protocol/model/openRealtimeModel";
import {OpenRealTimeModelResponse} from "../connection/protocol/model/openRealtimeModel";
import MessageType from "../connection/protocol/MessageType";
import OperationTransformer from "./ot/xform/OperationTransformer";
import TransformationFunctionRegistry from "./ot/xform/TransformationFunctionRegistry";
import ClientConcurrencyControl from "./ot/ClientConcurrencyControl";
import {CreateRealTimeModelRequest} from "../connection/protocol/model/createRealtimeModel";
import {DeleteRealTimeModelRequest} from "../connection/protocol/model/deleteRealtimeModel";
import Deferred from "../util/Deferred";
import {MessageEvent} from "../connection/ConvergenceConnection";
import {CloseRealTimeModelRequest} from "../connection/protocol/model/closeRealtimeModel";
import {ModelDataRequest} from "../connection/protocol/model/modelDataRequest";
import {ReplyCallback} from "../connection/ProtocolConnection";
import {ModelDataResponse} from "../connection/protocol/model/modelDataRequest";

export default class ModelService extends ConvergenceEventEmitter {

  private _openRequestsByFqn: { [key: string]: OpenRequest; } = {};
  private _openModelsByFqn: { [key: string]: RealTimeModel; } = {};
  private _openModelsByRid: { [key: string]: RealTimeModel; } = {};

  constructor(private _connection: ConvergenceConnection) {
    super();

    this._connection.addMultipleMessageListener(
      [MessageType.FORCE_CLOSE_REAL_TIME_MODEL,
        MessageType.REMOTE_OPERATION,
        MessageType.OPERATION_ACKNOWLEDGEMENT,
        MessageType.MODEL_DATA_REQUEST],
      (message: MessageEvent) => this._handleMessage(message));
  }

  session(): Session {
    return this._connection.session();
  }

  open(collectionId: string, modelId: string, initializer?: () => any): Promise<RealTimeModel> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    var k: string = fqn.hash();

    var openModel: RealTimeModel = this._openModelsByFqn[k];
    if (openModel !== undefined) {
      return Promise.resolve(openModel);
    }

    var openRequest: OpenRequest = this._openRequestsByFqn[k];
    if (openRequest !== undefined) {
      return openRequest.deferred.promise();
    }

    var request: OpenRealTimeModelRequest = {
      type: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      initializerProvided: initializer !== undefined
    };

    var deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    this._connection.request(request).then((response: OpenRealTimeModelResponse) => {
      var transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
      var clientConcurrencyControl: ClientConcurrencyControl =
        new ClientConcurrencyControl(this._connection.session().getSessionId(), response.version, transformer);
      var model: RealTimeModel = new RealTimeModel(
        response.resourceId,
        response.data,
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
      deferred: deferred,
      initializer: initializer
    };

    return deferred.promise();
  }

  create(collectionId: string, modelId: string, data: {[key: string]: any}): Promise<void> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    var request: CreateRealTimeModelRequest = {
      type: MessageType.CREATE_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      data: data
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  remove(collectionId: string, modelId: string): Promise<void> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);

    var request: DeleteRealTimeModelRequest = {
      type: MessageType.DELETE_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  _close(resourceId: string): Promise<void> {
    var request: CloseRealTimeModelRequest = {
      type: MessageType.CLOSES_REAL_TIME_MODEL_REQUEST,
      resourceId: resourceId
    };

    return this._connection.request(request).then(() => {
      return; // convert to Promise<void>
    });
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.MODEL_DATA_REQUEST:
        this._handleModelDataRequest(
          <ModelDataRequest>messageEvent.message,
          messageEvent.callback);
        break;
      default:
        var model: RealTimeModel = this._openModelsByRid[messageEvent.message.resourceId];
        if (model !== undefined) {
          model._handleMessage(messageEvent);
        } else {
          // todo error.
        }
    }
  }

  private _handleModelDataRequest(request: ModelDataRequest, replyCallback: ReplyCallback): void {
    var fqn: ModelFqn = request.modelFqn;
    var openReq: OpenRequest = this._openRequestsByFqn[fqn.hash()];
    if (openReq === undefined) {
      replyCallback.expectedError("unknown_model", "the requested model is not being opened");
    } else if (openReq.initializer === undefined) {
      replyCallback.expectedError("no_initializer", "No initializer was provided when opening the model");
    } else {
      var response: ModelDataResponse = {
        data: openReq.initializer(),
        type: MessageType.MODEL_DATA_RESPONSE
      };
      replyCallback.reply(response);
    }
  }
}

interface OpenRequest {
  deferred: Deferred<RealTimeModel>;
  initializer: () => any;
}

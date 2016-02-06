import EventEmitter from "../util/EventEmitter";
import Session from "../Session";
import RealTimeModel from "./RealTimeModel";
import ModelFqn from "./ModelFqn";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import {OpenRealTimeModelRequest} from "../protocol/model/openRealtimeModel";
import {OpenRealTimeModelResponse} from "../protocol/model/openRealtimeModel";
import MessageType from "../protocol/MessageType";
import OperationTransformer from "../ot/xform/OperationTransformer";
import TransformationFunctionRegistry from "../ot/xform/TransformationFunctionRegistry";
import ClientConcurrencyControl from "../ot/ClientConcurrencyControl";
import {CreateRealTimeModelRequest} from "../protocol/model/createRealtimeModel";
import {DeleteRealTimeModelRequest} from "../protocol/model/deleteRealtimeModel";
import Deferred from "../util/Deferred";
import {MessageEvent} from "../connection/ConvergenceConnection";


export default class ModelService extends EventEmitter {

  private _openRequests: { [key: string]: OpenRequest; } = {};
  private _openModelsByFqn: { [key: string]: RealTimeModel; } = {};
  private _openModelsByRid: { [key: string]: RealTimeModel; } = {};

  constructor(private _connection: ConvergenceConnection) {
    super();

    this._connection.addMultipleMessageListener(
      [MessageType.FORCE_CLOSE_REAL_TIME_MODEL],
      (message: MessageEvent) => this._handleMessage(message));
  }

  private _handleMessage(messageEvent: MessageEvent): void {
    var model: RealTimeModel = this._openModelsByRid[messageEvent.message.resourceId];
    if (model !== undefined) {
      model._handleMessage(messageEvent);
    } else {
      // todo erro.
    }
  }

  session(): Session {
    return this._connection.session();
  }

  open(collectionId: string, modelId: string, initializer?: () => any): Promise<RealTimeModel> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    var k: string = ModelService._createModelKey(fqn);

    var openModel: RealTimeModel = this._openModelsByFqn[k];
    if (openModel !== undefined) {
      return Promise.resolve(openModel);
    }

    var openRequest: OpenRequest = this._openRequests[k];
    if (openRequest !== undefined) {
      return openRequest.deferred.promise();
    }

    var request: OpenRealTimeModelRequest = {
      modelFqn: fqn,
      initializerProvided: initializer !== undefined,
      type: MessageType.OPEN_REAL_TIME_MODEL
    };

    var deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    this._connection.request(request).then((response: OpenRealTimeModelResponse) => {
      var transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
      var clientConcurrencyControl: ClientConcurrencyControl =
        new ClientConcurrencyControl(this._connection.session().getSessionId(), response.version, transformer);
      var model: RealTimeModel = new RealTimeModel(
        response.data,
        response.version,
        new Date(response.createdTime),
        new Date(response.modifiedTime),
        fqn,
        clientConcurrencyControl,
        this._connection);

      this._openModelsByFqn[k] = model;
      this._openModelsByRid[response.resourceId] = model;
      delete this._openRequests[k];

      deferred.resolve(model);
    }).catch((error: Error) => {
      deferred.reject(error);
    });

    this._openRequests[k] = {
      deferred: deferred,
      initializer: initializer
    };

    return deferred.promise();
  }

  create(collectionId: string, modelId: string, data: any): Promise<void> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    var request: CreateRealTimeModelRequest = {
      modelFqn: fqn,
      data: data,
      type: MessageType.CREATE_REAL_TIME_MODEL
    };

    return this._connection.request(request).then(() => {
      // convert to void
    });
  }

  remove(collectionId: string, modelId: string): Promise<void> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);

    var request: DeleteRealTimeModelRequest = {
      modelFqn: fqn,
      type: MessageType.DELETE_REAL_TIME_MODEL
    };

    return this._connection.request(request).then(() => {
      // convert to void
    });
  }

  private static _createModelKey(fqn: ModelFqn): string {
    return fqn.collectionId + "/" + fqn.modelId;
  }
}

interface OpenRequest {
  deferred: Deferred<RealTimeModel>;
  initializer: () => any;
}

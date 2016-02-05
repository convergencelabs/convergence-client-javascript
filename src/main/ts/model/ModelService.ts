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


export default class ModelService extends EventEmitter {

  /**
   * Constructs a new ModelService.
   */
  constructor(private _connection: ConvergenceConnection) {
    super();
  }

  /**
   * Gets the session of the connected user.
   * @return {Session} The users session.
   */
  get session(): Session {
    return this._connection.session();
  }

  /**
   * Opens a real time model in a given collection
   *
   * @param {string} collectionId
   *            The collectionId of the model
   * @param {string} modelId
   *            The modelId
   * @return {Promise} A promise that resolves with a RealTimeModel
   */
  open(collectionId: string, modelId: string): Promise<RealTimeModel> {
    var fqn: ModelFqn = new ModelFqn(collectionId, modelId);
    var request: OpenRealTimeModelRequest = {
      modelFqn: fqn,
      initializerProvided: false,
      type: MessageType.OPEN_REAL_TIME_MODEL
    };

    return this._connection.request(request).then((response: OpenRealTimeModelResponse) => {
      var transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
      // todo: Is unapplied operation still relevent???
      var clientConcurrencyControl: ClientConcurrencyControl =
        new ClientConcurrencyControl(this.session.getSessionId(), response.version, [], transformer);
      var model: RealTimeModel = new RealTimeModel(
        response.data,
        response.version,
        new Date(response.createdTime),
        new Date(response.modifiedTime),
        fqn,
        clientConcurrencyControl,
        this._connection);
      return model;
    });
  }

  /**
   * Create a new real time model with the given value in a given collection
   *
   * @param {string} collectionId
   *            The collection to add the model to
   * @param {string} modelId
   *            The id of the new model
   * @param {string} data
   *            The initial value
   * @return {Q.Promise} A Promise that resolves when the model is finished being created
   */
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

  /**
   * Removes an existing model in a given collection
   *
   * @param {string} collectionId
   *            The collection the model belongs to
   * @param {string} modelId
   *            The id of the model to remove
   * @return {Q.Promise} A Promise that resolves when the model is finished being deleted
   */
  remove(collectionId: string, modelId: string): Promise<void> {
    return Promise.resolve();
  }
}

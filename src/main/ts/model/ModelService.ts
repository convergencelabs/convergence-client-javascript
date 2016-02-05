import EventEmitter from "../util/EventEmitter";
import Session from "../Session";
import RealTimeModel from "./RealTimeModel";
import ModelFqn from "./ModelFqn";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import {OpenRealTimeModelRequest} from "../protocol/model/openRealtimeModel";
import {OpenRealTimeModelResponse} from "../protocol/model/openRealtimeModel";
import OperationTransformer from "../ot/xform/OperationTransformer";
import TransformationFunctionRegistry from "../ot/xform/TransformationFunctionRegistry";
import ClientConcurrencyControl from "../ot/ClientConcurrencyControl";

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
    var request: OpenRealTimeModelRequest = <OpenRealTimeModelRequest>{
      modelFqn: fqn
    };

    return this._connection.request(request).then((response: OpenRealTimeModelResponse) => {

      var transformer = new OperationTransformer(new TransformationFunctionRegistry());
      //TODO: Is unapplied operation still relevent???
      var clientConcurrencyControl = new ClientConcurrencyControl(this.session.getSessionId(), response.version, [], transformer);
      var model = new RealTimeModel(response.data, response.version, new Date(response.createdTime), new Date(response.modifiedTime), fqn, clientConcurrencyControl, this._connection);
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
    return Promise.resolve();
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

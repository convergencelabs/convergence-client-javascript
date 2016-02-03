import EventEmitter from "../util/EventEmitter";
import ModelFqn from "./ModelFqn";
import RealTimeObject from "./RealTimeObject";
import Session from "../Session";
import ClientConcurrencyControl from "../ot/ClientConcurrencyControl";
import OperationTransformer from "../ot/xform/OperationTransformer";
import TransformationFunctionRegistry from "../ot/xform/TransformationFunctionRegistry";

export default class RealTimeModel extends EventEmitter {

  private _concurencyControl: ClientConcurrencyControl;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(private _modelFqn: ModelFqn, private _data: RealTimeObject, private _session: Session) {
    super();
    var xformer = new OperationTransformer(new TransformationFunctionRegistry());
    // fixme
    this._concurencyControl = new ClientConcurrencyControl("", 0, [], xformer);
  }

  collectionId(): string {
    return this._modelFqn.collectionId;
  }

  modelId(): string {
    return this._modelFqn.modelId;
  }

  version(): number {
    return 0;
  }

  createdTime(): Date {
    return new Date();
  }

  modifiedTime(): Date {
    return new Date();
  }

  data(): RealTimeObject {
    return this._data;
  }

  /**
   * Gets the session of the connected user.
   * @return {convergence.Session} The users session.
   */
  session(): Session {
    return this._session;
  }
}

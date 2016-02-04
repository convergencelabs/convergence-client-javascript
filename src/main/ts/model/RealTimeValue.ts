import EventEmitter from "../util/EventEmitter";
import DataType from "./DataType";
import {PathElement, Path} from "./Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";

abstract class RealTimeValue extends EventEmitter {

  private _detached: boolean = false;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(private modelType: DataType,
              private parent: RealTimeValue,
              public fieldInParent: PathElement,
              protected sendOpCallback: (operation: DiscreteOperation) => void) {
    super();
  }

  type(): DataType {
    return this.modelType;
  }

  path(): Path {
    if (this.parent == null) {
      return [];
    } else {
      var path: Path = this.parent.path();
      path.push(this.fieldInParent);
      return path;
    }
  }

  isDetached(): boolean {
    return this._detached;
  }

  _setDetached(): void {
    this.parent = null;
    this._detached = true;
    this.emit("detached");
  }

  _exceptionIfDetached(): void {
    throw Error("Detached Exception: RealTimeValue is no longer a part of the data model.");
  }

  abstract value(): any;

  abstract _handleIncomingOperation(operationEvent: ModelOperationEvent): void;

}

export default RealTimeValue;

import EventEmitter from "../util/EventEmitter";
import DataType from "./RealTimeValueType";
import {PathElement, Path} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeContainerValue from "./RealTimeContainerValue";

abstract class RealTimeValue<T> extends EventEmitter {

  private _detached: boolean = false;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(private modelType: DataType,
              private parent: RealTimeContainerValue<any>,
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

  abstract value(): T;

  abstract _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void;

}

export default RealTimeValue;

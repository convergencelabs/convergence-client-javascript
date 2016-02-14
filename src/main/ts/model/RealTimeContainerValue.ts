import RealTimeValue from "./RealTimeValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import DataType from "./RealTimeValueType";
import {Path} from "../ot/Path";

abstract class RealTimeContainerValue<T> extends RealTimeValue<T> {

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: DataType,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(modelType, parent, fieldInParent, sendOpCallback);
  }

  _detach(): void {
    this._detachChildren();
    super._detach();
  }

  child(pathArgs: any): RealTimeValue<any> {
    // We're letting them pass in individual path arguments or a single array of path arguments
    var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
    if (pathArgsForReal.length === 0) {
      throw new Error("relative path of child must contain at least one element.");
    }
    return this._path(pathArgsForReal);
  }

  abstract _path(pathArgs: Path): RealTimeValue<any>;

  protected abstract _detachChildren(): void;

}

export default RealTimeContainerValue;

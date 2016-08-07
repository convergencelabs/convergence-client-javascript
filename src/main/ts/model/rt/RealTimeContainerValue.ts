import {RealTimeValue} from "./RealTimeValue";
import {ObservableContainerValue} from "../observable/ObservableContainerValue";
import {ModelValueType} from "../ModelValueType";
import {PathElement, Path} from "../ot/Path";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";

export abstract class RealTimeContainerValue<T> extends RealTimeValue<T> implements ObservableContainerValue<T> {

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: ModelValueType,
              id: string,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(modelType, id, parent, fieldInParent, callbacks, model);
  }

  _detach(): void {
    this._detachChildren();
    super._detach();
  }

  valueAt(pathArgs: any): RealTimeValue<any> {
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

import {RealTimeValue} from "./RealTimeValue";
import {PathElement} from "./ot/Path";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "./ot/Path";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {ModelChangeEvent} from "./events";
import {ConvergenceEvent} from "../util/ConvergenceEvent";

export abstract class RealTimeContainerValue<T> extends RealTimeValue<T> {

  static Events: any = {
    CHILD_CHANGED: "child_changed"
  };

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: RealTimeValueType,
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

  dataAt(pathArgs: any): RealTimeValue<any> {
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

export interface ChildChangedEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ModelChangeEvent;
}

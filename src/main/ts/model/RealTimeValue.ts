import EventEmitter from "../util/EventEmitter";
import DataType from "./RealTimeValueType";
import {PathElement, Path} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {ModelDetachedEvent} from "./events";

abstract class RealTimeValue<T> extends EventEmitter {

  static Events: any = {
    DETACHED: "detached"
  };

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
    var event: ModelDetachedEvent = {
      src: this,
      name: RealTimeValue.Events.DETACHED
    };

    this.emitEvent(event);
  }

  _exceptionIfDetached(): void {
    throw Error("Detached Exception: RealTimeValue is no longer a part of the data model.");
  }

  value(): T
  value(value: T): void
  value(value?: T): any {
    if (arguments.length === 0) {
      return this._getValue();
    } else {
      this._setValue(value);
      return;
    }
  }

  protected abstract _getValue(): T;
  protected abstract _setValue(value: T): void;

  abstract _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void;

}

export default RealTimeValue;

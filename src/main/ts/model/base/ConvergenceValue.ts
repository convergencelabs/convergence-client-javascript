import {PathElement, Path} from "../ot/Path";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {RealTimeValue} from "../RealTimeValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {ConvergenceValueType} from "./ConvergenceValueType";

export abstract class ConvergenceValue<T> extends ConvergenceEventEmitter {

  static Events: any = {
    DETACHED: "detached",
    REFERENCE: "reference",
    MODEL_CHANGED: "model_changed"
  };

  private _id: string;
  private _type: ConvergenceValueType;
  protected _parent: ConvergenceContainerValue<any>;
  protected _model: ConvergenceModel;


  /**
   * Constructs a new RealTimeValue.
   */
  constructor(type: ConvergenceValueType,
              id: string,
              parent: ConvergenceContainerValue<any>,
              public fieldInParent: PathElement,
              model: ConvergenceModel) {
    super();
    this._id = id;
    this._type = type;
    this._parent = parent;
    this._model = model;
  }

  id(): string {
    return this._id;
  }

  type(): ConvergenceValueType {
    return this._type;
  }

  path(): Path {
    if (this._parent === null) {
      return [];
    } else {
      var path: Path = this._parent.path();
      path.push(this.fieldInParent);
      return path;
    }
  }

  model(): ConvergenceModel {
    return this._model;
  }

  isDetached(): boolean {
    return this._model === null;
  }

  _detach(): void {
    this._model._unregisterValue(this);

    this._model = null;
    this._parent = null;

    var event: ValueDetachedEvent = {
      src: this,
      name: RealTimeValue.Events.DETACHED
    };

    this.emitEvent(event);
  }

  value(): T {
      return this._getValue();
  }

  protected abstract _getValue(): T;

  abstract _handleRemoteOperation(operationEvent: ModelOperationEvent): void;

  _bubbleModelChangedEvent(childEvent: ModelValueEvent, relativePath: Path = []): void {
    var event: ModelChangedEvent = {
      name: ConvergenceValue.Events.MODEL_CHANGED,
      src: this,
      relativePath: relativePath,
      childEvent: childEvent
    };
    this.emitEvent(event);

    if (this._parent) {
      var newPath: Path = relativePath.slice(0);
      newPath.unshift(this.fieldInParent);
      this._parent._bubbleModelChangedEvent(childEvent, newPath);
    }
  }
}

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  src: ConvergenceValue<any>;
}

export interface ValueDetachedEvent extends ConvergenceModelValueEvent {
  src: ConvergenceValue<any>;
}

export interface ModelValueEvent extends ConvergenceModelValueEvent {
  sessionId: string;
  username: string;
  version: number;
  timestamp: number;
}

export interface ModelChangedEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ModelValueEvent;
}

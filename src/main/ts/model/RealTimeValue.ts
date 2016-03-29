import RealTimeValueType from "./RealTimeValueType";
import {PathElement, Path} from "./ot/Path";
import DiscreteOperation from "./ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ModelDetachedEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ModelReference} from "./reference/ModelReference";
import {ModelChangeEvent} from "./events";

export abstract class RealTimeValue<T> extends ConvergenceEventEmitter {

  static Events: any = {
    DETACHED: "detached",
    REFERENCE: "reference",
    MODEL_CHANGED: "model_changed"
  };

  private _id: string;
  private _modelType: RealTimeValueType;
  protected _parent: RealTimeContainerValue<any>;
  protected _callbacks: ModelEventCallbacks;
  protected _model: RealTimeModel;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(modelType: RealTimeValueType,
              id: string,
              parent: RealTimeContainerValue<any>,
              public fieldInParent: PathElement, // fixme not sure I like this being public
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super();
    this._id = id;
    this._modelType = modelType;
    this._parent = parent;
    this._callbacks = callbacks;
    this._model = model;

    this._model._registerValue(this);
  }

  id(): string {
    return this._id;
  }

  type(): RealTimeValueType {
    return this._modelType;
  }

  path(): Path {
    if (this._parent == null) {
      return [];
    } else {
      var path: Path = this._parent.path();
      path.push(this.fieldInParent);
      return path;
    }
  }

  model(): RealTimeModel {
    return this._model;
  }

  isDetached(): boolean {
    return this._model === null;
  }

  _detach(): void {
    this._model._unregisterValue(this);

    this._model = null;
    this._parent = null;
    this._callbacks = null;

    var event: ModelDetachedEvent = {
      src: this,
      name: RealTimeValue.Events.DETACHED
    };

    this.emitEvent(event);
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

  private _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached RealTimeValue.");
    }
  }

  protected _sendOperation(operation: DiscreteOperation): void {
    this._exceptionIfDetached();
    this._callbacks.sendOperationCallback(operation);
  }

  protected abstract _getValue(): T;

  protected abstract _setValue(value: T): void;

  abstract _handleRemoteOperation(operationEvent: ModelOperationEvent): void;

  abstract _handleRemoteReferenceEvent(referenceEvent: RemoteReferenceEvent): void;

  reference(sessionId: string, key: string): ModelReference<any> {
    return;
  }

  references(sessionId?: string, key?: string): ModelReference<any>[] {
    return;
  }

  protected _fireReferenceCreated(reference: ModelReference<any>): void {
    var createdEvent: RemoteReferenceCreatedEvent = {
      name: RealTimeValue.Events.REFERENCE,
      src: this,
      reference: reference
    };
    this.emitEvent(createdEvent);
  }

  _bubbleModelChangedEvent(childEvent: ModelChangeEvent, relativePath: Path = []): void {
    var event: ModelChangedEvent = {
      name: RealTimeValue.Events.MODEL_CHANGED,
      src: this,
      relativePath: relativePath,
      childEvent: childEvent
    };
    this.emitEvent(event);

    if (this._parent) {
      var newPath: Path = relativePath.slice(0);
      newPath.push(this.fieldInParent);
      this._parent._bubbleModelChangedEvent(childEvent, newPath);
    }
  }
}

export interface ModelChangedEvent extends ConvergenceEvent {
  relativePath: Path;
  childEvent: ModelChangeEvent;
}

export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  reference: ModelReference<any>;
}

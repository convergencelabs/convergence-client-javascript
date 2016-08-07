import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {
  ObservableValue,
  ValueChangedEvent,
  ModelChangedEvent, ValueDetachedEvent
} from "../observable/ObservableValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {ModelValueType} from "../ModelValueType";
import {PathElement, Path} from "../ot/Path";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReference} from "../reference/ModelReference";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";


export abstract class RealTimeValue<T> extends ConvergenceEventEmitter implements ObservableValue<T> {

  static Events: any = {
    DETACHED: "detached",
    REFERENCE: "reference",
    MODEL_CHANGED: "model_changed"
  };

  private _id: string;
  private _modelType: ModelValueType;
  protected _parent: RealTimeContainerValue<any>;
  protected _callbacks: ModelEventCallbacks;
  protected _model: RealTimeModel;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(modelType: ModelValueType,
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

  type(): ModelValueType {
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

    var event: ValueDetachedEvent = {
      src: this,
      name: RealTimeValue.Events.DETACHED
    };

    this.emitEvent(event);
  }

  data(): T
  data(value: T): void
  data(value?: T): any {
    if (arguments.length === 0) {
      return this._getData();
    } else {
      this._setData(value);
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

  protected abstract _getData(): T;

  protected abstract _setData(value: T): void;

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

  _bubbleModelChangedEvent(childEvent: ValueChangedEvent, relativePath: Path = []): void {
    var event: ModelChangedEvent = {
      name: RealTimeValue.Events.MODEL_CHANGED,
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

export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  reference: ModelReference<any>;
}

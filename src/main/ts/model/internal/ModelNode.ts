import {ModelElementType} from "../ModelElementType";
import {Model} from "./Model";
import {Path} from "../ot/Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {NodeValueChangedEvent} from "./events";
import {NodeChangedEvent} from "./events";
import {NodeDetachedEvent} from "./events";
import {DataValue} from "../dataValue";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelNodeEvent} from "./events";

export abstract class ModelNode<T> extends ConvergenceEventEmitter<ModelNodeEvent> {

  public static Events: any = {
    DETACHED: "detached",
    NODE_CHANGED: "node_changed",
    OPERATION: "operation"
  };

  protected _model: Model;
  protected _path: () => Path;

  private _id: string;
  private _modelType: ModelElementType;

  /**
   * Constructs a new RealTimeElement.
   */
  constructor(modelType: ModelElementType,
              id: string,
              path: () => Path,
              model: Model,
              public sessionId: string,
              public username: string) {
    super();
    this._id = id;
    this._modelType = modelType;
    this._model = model;
    this._path = path;

    this._model._registerValue(this);
  }

  public id(): string {
    return this._id;
  }

  public type(): ModelElementType {
    return this._modelType;
  }

  public path(): Path {
   return this._path();
  }

  public model(): Model {
    return this._model;
  }

  public isDetached(): boolean {
    return this._model === null;
  }

  public _detach(local: boolean): void {
    this._model._unregisterValue(this);
    this._model = null;

    const event: NodeDetachedEvent = new NodeDetachedEvent(this, local);
    this._emitEvent(event);
  }

  public data(): T
  public data(value: T): void
  public data(value?: T): any {
    if (arguments.length === 0) {
      return this._getData();
    } else {
      this._setData(value);
      return;
    }
  }

  public abstract dataValue(): DataValue

  public abstract _handleModelOperationEvent(operationEvent: ModelOperationEvent): void;

  protected _emitValueEvent(event: NodeValueChangedEvent): void {
    this._emitEvent(event);
    this._emitEvent(new NodeChangedEvent(this, event.local, [], event, this.sessionId, this.username));
  }

  protected _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached ModelNode.");
    }
  }

  protected abstract _getData(): T;

  protected abstract _setData(value: T): void;
}

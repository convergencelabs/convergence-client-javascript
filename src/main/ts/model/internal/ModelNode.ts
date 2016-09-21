import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelValueType} from "../ModelValueType";
import {Model} from "./Model";
import {Path} from "../ot/Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {NodeValueChangedEvent} from "./events";
import {NodeChangedEvent} from "./events";
import {NodeDetachedEvent} from "./events";
import {DataValue} from "../dataValue";

export abstract class ModelNode<T> extends ConvergenceEventEmitter {

  static Events: any = {
    DETACHED: "detached",
    NODE_CHANGED: "node_changed",
    OPERATION: "operation"
  };

  private _id: string;
  private _modelType: ModelValueType;
  protected _model: Model;
  protected _path: () => Path;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(modelType: ModelValueType,
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

  id(): string {
    return this._id;
  }

  type(): ModelValueType {
    return this._modelType;
  }

  path(): Path {
   return this._path();
  }

  model(): Model {
    return this._model;
  }

  isDetached(): boolean {
    return this._model === null;
  }

  _detach(): void {
    this._model._unregisterValue(this);
    this._model = null;

    var event: NodeDetachedEvent = new NodeDetachedEvent(this);

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

  protected _emitValueEvent(event: NodeValueChangedEvent): void {
    this.emitEvent(event);
    this.emitEvent(new NodeChangedEvent(this, event.local, [], event, this.sessionId, this.username));
  }

  protected _exceptionIfDetached(): void {
    if (this.isDetached()) {
      throw Error("Can not perform actions on a detached ModelNode.");
    }
  }

  abstract dataValue(): DataValue

  protected abstract _getData(): T;

  protected abstract _setData(value: T): void;

  abstract _handleModelOperationEvent(operationEvent: ModelOperationEvent): void;
}

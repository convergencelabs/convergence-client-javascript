import {RealTimeValue} from "../RealTimeValue";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export var ReferenceType: any = {
  INDEX: "index",
  RANGE: "range",
  PROPERTY: "property",
  PATH: "path"
};
Object.freeze(ReferenceType);

export abstract class ModelReference<V> extends ConvergenceEventEmitter {

  static Events: any = {
    CLEARED: "cleared",
    CHANGED: "changed",
    DISPOSED: "disposed"
  };

  private _disposed: boolean;
  protected _value: V;

  constructor(private _type: string,
              private _key: string,
              private _source: RealTimeValue<any>,
              private _userId: string,
              private _sessionId: string) {
    super();
    this._disposed = false;
    this._value = null;
  }

  type(): string {
    return this._type;
  }

  key(): string {
    return this._key;
  }

  source(): RealTimeValue<any> {
    return this._source;
  }

  isLocal(): boolean {
    return false;
  }

  userId(): string {
    return this._userId;
  }

  sessionId(): string {
    return this._sessionId;
  }

  isDisposed(): boolean {
    return this._disposed;
  }

  _dispose(): void {
    this._disposed = true;
    var event: ReferenceDisposedEvent = {
      name: ModelReference.Events.DISPOSED,
      src: this
    };
    this.emitEvent(event);
    this.removeAllListenersForAllEvents();
  }

  value(): V {
    return this._value;
  }

  isSet(): boolean {
    return this._value !== null;
  }

  _set(value: V, local: boolean = false): void {
    this._value = value;
    var event: ReferenceChangedEvent = {
      name: ModelReference.Events.CHANGED,
      src: this,
      local: local
    };
    this.emitEvent(event);
  }

  _clear(): void {
    this._value = null;
    var event: ReferenceClearedEvent = {
      name: ModelReference.Events.CLEARED,
      src: this
    };
    this.emitEvent(event);
  }

  protected _setIfChanged(newIndex: V): void {
    if (this._value !== newIndex) {
      this._set(newIndex);
    }
  }
}

export interface ReferenceChangedEvent extends ConvergenceEvent {
  src: ModelReference<any>;
  local: boolean;
}

export interface ReferenceClearedEvent extends ConvergenceEvent {
  src: ModelReference<any>;
}

export interface ReferenceDisposedEvent extends ConvergenceEvent {
  src: ModelReference<any>;
}

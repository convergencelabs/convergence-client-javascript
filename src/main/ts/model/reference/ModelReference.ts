import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {EqualsUtil} from "../../util/EqualsUtil";

export var ReferenceType: any = {
  INDEX: "index",
  RANGE: "range",
  PROPERTY: "property",
  PATH: "path",
  CELL: "cell",
  ELEMENT: ""
};
Object.freeze(ReferenceType);

export abstract class ModelReference<V> extends ConvergenceEventEmitter {

  static Events: any = {
    SET: "set",
    CLEARED: "cleared",
    DISPOSED: "disposed"
  };

  private _disposed: boolean;
  protected _value: V;
  private _type: string;
  private _key: string;
  private _source: any;
  private _username: string;
  private _sessionId: string;
  private _local: boolean;

  constructor(type: string,
              key: string,
              source: any,
              username: string,
              sessionId: string,
              local: boolean) {
    super();
    this._disposed = false;
    this._value = null;
    this._type = type;
    this._key = key;
    this._source = source;
    this._username = username;
    this._sessionId = sessionId;
    this._local = local;
  }

  type(): string {
    return this._type;
  }

  key(): string {
    return this._key;
  }

  source(): any {
    return this._source;
  }

  isLocal(): boolean {
    return this._local;
  }

  username(): string {
    return this._username;
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
      name: ModelReference.Events.SET,
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

  protected _setIfChanged(value: V): void {
    if (!EqualsUtil.deepEquals(this._value, value)) {
      this._set(value);
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

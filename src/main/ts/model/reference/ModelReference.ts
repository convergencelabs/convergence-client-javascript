import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {EqualsUtil} from "../../util/EqualsUtil";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ReferenceManager} from "./ReferenceManager";

export var ReferenceType: any = {
  INDEX: "index",
  RANGE: "range",
  PROPERTY: "property",
  ELEMENT: "element"
};
Object.freeze(ReferenceType);

export abstract class ModelReference<V> extends ConvergenceEventEmitter<ConvergenceEvent> {

  static Events: any = {
    SET: "set",
    CLEARED: "cleared",
    DISPOSED: "disposed"
  };

  private _referenceManager: ReferenceManager;
  private _disposed: boolean;
  protected _values: V[];
  private _type: string;
  private _key: string;
  private _source: any;
  private _username: string;
  private _sessionId: string;
  private _local: boolean;

  constructor(referenceManager: ReferenceManager,
              type: string,
              key: string,
              source: any,
              username: string,
              sessionId: string,
              local: boolean) {
    super();
    this._referenceManager = referenceManager;
    this._disposed = false;
    this._values = [];
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
    this._emitEvent(event);
    this.removeAllListenersForAllEvents();
    this._referenceManager._handleReferenceDisposed(this);
  }

  value(): V {
    return this._values[0];
  }

  values(): V[] {
    return this._values;
  }

  isSet(): boolean {
    return this._values.length > 0;
  }

  _set(values: V[], local: boolean = false): void {
    this._values = values;
    var event: ReferenceChangedEvent = {
      name: ModelReference.Events.SET,
      src: this,
      local: local
    };
    this._emitEvent(event);
  }

  _clear(): void {
    this._values = [];
    var event: ReferenceClearedEvent = {
      name: ModelReference.Events.CLEARED,
      src: this
    };
    this._emitEvent(event);
  }

  protected _setIfChanged(values: V[]): void {
    if (!EqualsUtil.deepEquals(this._values, values)) {
      this._set(values);
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

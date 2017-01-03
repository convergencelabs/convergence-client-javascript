import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {EqualsUtil} from "../../util/EqualsUtil";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ReferenceManager} from "./ReferenceManager";

export const ReferenceType: any = {
  INDEX: "index",
  RANGE: "range",
  PROPERTY: "property",
  ELEMENT: "element"
};
Object.freeze(ReferenceType);

export abstract class ModelReference<V> extends ConvergenceEventEmitter<ConvergenceEvent> {

  public static Events: any = {
    SET: "set",
    CLEARED: "cleared",
    DISPOSED: "disposed"
  };

  protected _values: V[];

  private _referenceManager: ReferenceManager;
  private _disposed: boolean;
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

  public type(): string {
    return this._type;
  }

  public key(): string {
    return this._key;
  }

  public source(): any {
    return this._source;
  }

  public isLocal(): boolean {
    return this._local;
  }

  public username(): string {
    return this._username;
  }

  public sessionId(): string {
    return this._sessionId;
  }

  public isDisposed(): boolean {
    return this._disposed;
  }

  public _dispose(): void {
    this._disposed = true;
    const event: ReferenceDisposedEvent = {
      name: ModelReference.Events.DISPOSED,
      src: this
    };
    this._emitEvent(event);
    this.removeAllListenersForAllEvents();
    this._referenceManager._handleReferenceDisposed(this);
  }

  public value(): V {
    return this._values[0];
  }

  public values(): V[] {
    return this._values;
  }

  public isSet(): boolean {
    return this._values.length > 0;
  }

  public _set(values: V[], local: boolean = false): void {
    this._values = values;
    const event: ReferenceChangedEvent = {
      name: ModelReference.Events.SET,
      src: this,
      local
    };
    this._emitEvent(event);
  }

  public _clear(): void {
    this._values = [];
    const event: ReferenceClearedEvent = {
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

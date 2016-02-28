import RealTimeValue from "../RealTimeValue";
import EventEmitter from "../../util/EventEmitter";

export var ReferenceType: any = {
  INDEX: "index",
  RANGE: "range",
  PROPERTY: "property",
  PATH: "path"
};

export abstract class ModelReference extends EventEmitter {

  static Events: any = {
    CLEARED: "cleared",
    CHANGED: "changed",
    DISPOSED: "disposed"
  };

  private _disposed: boolean;

  constructor(private _type: string,
              private _key: string,
              private _source: RealTimeValue<any>,
              private _userId: string,
              private _sessionId: string) {
    super();
    this._disposed = false;
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
    this.emit(ModelReference.Events.DISPOSED, {});
  }

  abstract isSet(): boolean;
}

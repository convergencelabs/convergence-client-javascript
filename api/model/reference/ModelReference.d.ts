import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
export declare var ReferenceType: any;
export declare abstract class ModelReference<V> extends ConvergenceEventEmitter {
  static Events: any;
  private _disposed;
  protected _values: V[];
  private _type;
  private _key;
  private _source;
  private _username;
  private _sessionId;
  private _local;

  constructor(type: string, key: string, source: any, username: string, sessionId: string, local: boolean);

  type(): string;

  key(): string;

  source(): any;

  isLocal(): boolean;

  username(): string;

  sessionId(): string;

  isDisposed(): boolean;

  _dispose(): void;

  value(): V;

  values(): V[];

  isSet(): boolean;

  _set(values: V[], local?: boolean): void;

  _clear(): void;

  protected _setIfChanged(values: V[]): void;
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

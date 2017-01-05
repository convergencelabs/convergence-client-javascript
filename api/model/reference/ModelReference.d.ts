import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export declare var ReferenceType: any;

export declare abstract class ModelReference<V> extends ConvergenceEventEmitter<ConvergenceEvent> {
  public static Events: any;

  public type(): string;

  public key(): string;

  public source(): any;

  public isLocal(): boolean;

  public username(): string;

  public sessionId(): string;

  public isDisposed(): boolean;

  public value(): V;

  public values(): V[];

  public isSet(): boolean;
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

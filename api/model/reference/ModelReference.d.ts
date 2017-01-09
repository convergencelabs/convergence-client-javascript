import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";

export interface ModelReferenceTypes {
  readonly INDEX: string;
  readonly RANGE: string;
  readonly PROPERTY: string;
  readonly ELEMENT: string;
}

export interface ModelReferenceEvents {
  readonly SET: string;
  readonly CLEARED: string;
  readonly DISPOSED: string;
}

export declare abstract class ModelReference<V> extends ConvergenceEventEmitter<ConvergenceEvent> {
  public static readonly Events: ModelReferenceEvents;

  public static readonly Types: ModelReferenceTypes;

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

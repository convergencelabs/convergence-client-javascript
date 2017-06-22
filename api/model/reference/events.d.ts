import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelReference} from "./ModelReference";

export declare class ReferenceChangedEvent<T> implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
  public readonly oldValues: T[];
  public readonly oldValue: T;
  public readonly addedValues: T[];
  public readonly removedValues: T[];
  public readonly local: boolean;
}

export declare class ReferenceClearedEvent<T> implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
  public readonly oldValues: T[];
  public readonly oldValue: T;
  public readonly local: boolean;
}

export declare class ReferenceDisposedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
}

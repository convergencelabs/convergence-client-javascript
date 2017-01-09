import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelReference} from "./ModelReference";

export declare class ReferenceChangedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
  public readonly local: boolean;
}

export declare class ReferenceClearedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
}

export declare class ReferenceDisposedEvent implements ConvergenceEvent {
  public static readonly NAME: string;
  public readonly name: string;
  public readonly src: ModelReference<any>;
}

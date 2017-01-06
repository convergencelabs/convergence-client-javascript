import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelReference} from "./ModelReference";

export class ReferenceChangedEvent implements ConvergenceEvent {
  public static readonly NAME = "set";
  public readonly name: string = ReferenceChangedEvent.NAME;

  constructor(public readonly src: ModelReference<any>, public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ReferenceClearedEvent implements ConvergenceEvent {
  public static readonly NAME = "cleared";
  public readonly name: string = ReferenceClearedEvent.NAME;

  constructor(public readonly src: ModelReference<any>) {
    Object.freeze(this);
  }
}

export class ReferenceDisposedEvent implements ConvergenceEvent {
  public static readonly NAME = "disposed";
  public readonly name: string = ReferenceDisposedEvent.NAME;

  constructor(public readonly src: ModelReference<any>) {
    Object.freeze(this);
  }
}

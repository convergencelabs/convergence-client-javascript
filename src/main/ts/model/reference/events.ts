import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ModelReference} from "./ModelReference";

export class ReferenceChangedEvent<T> implements ConvergenceEvent {
  public static readonly NAME = "set";
  public readonly name: string = ReferenceChangedEvent.NAME;
  public readonly oldValue: T;

  constructor(public readonly src: ModelReference<any>,
              public readonly oldValues: T[],
              public readonly addedValues: T[],
              public readonly removedValues: T[],
              public readonly local: boolean) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}

export class ReferenceClearedEvent<T> implements ConvergenceEvent {
  public static readonly NAME = "cleared";
  public readonly name: string = ReferenceClearedEvent.NAME;
  public readonly oldValue: T;

  constructor(public readonly src: ModelReference<any>,
              public readonly oldValues: T[],
              public readonly local: boolean) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

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

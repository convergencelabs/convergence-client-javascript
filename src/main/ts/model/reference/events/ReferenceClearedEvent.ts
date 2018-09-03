import {ConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

export class ReferenceClearedEvent<T> implements ConvergenceEvent {
  public static readonly NAME = "cleared";
  public readonly name: string = ReferenceClearedEvent.NAME;
  public readonly oldValue: T;

  constructor(public readonly src: ModelReference<any>,
              public readonly oldValues: T[]) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}

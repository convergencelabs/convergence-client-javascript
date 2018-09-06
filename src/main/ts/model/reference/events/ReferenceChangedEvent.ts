import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

export class ReferenceChangedEvent<T> implements IConvergenceEvent {
  public static readonly NAME = "set";
  public readonly name: string = ReferenceChangedEvent.NAME;
  public readonly oldValue: T;

  constructor(public readonly src: ModelReference<any>,
              public readonly oldValues: T[],
              public readonly addedValues: T[],
              public readonly removedValues: T[]) {
    if (oldValues.length > 0) {
      this.oldValue = oldValues[0];
    }

    Object.freeze(this);
  }
}

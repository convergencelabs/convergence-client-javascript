import {IConvergenceEvent} from "../../../util";
import {ModelReference} from "../ModelReference";

export class ReferenceDisposedEvent implements IConvergenceEvent {
  public static readonly NAME = "disposed";
  public readonly name: string = ReferenceDisposedEvent.NAME;

  constructor(public readonly src: ModelReference<any>) {
    Object.freeze(this);
  }
}

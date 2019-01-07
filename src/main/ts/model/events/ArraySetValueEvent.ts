import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {DomainUser} from "../../identity";

export class ArraySetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ArraySetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableArray,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

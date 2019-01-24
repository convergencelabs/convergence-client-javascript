import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

export class NumberSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = NumberSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableNumber,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

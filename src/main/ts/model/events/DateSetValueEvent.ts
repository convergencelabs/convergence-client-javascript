import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableDate} from "../observable/ObservableDate";
import {DomainUser} from "../../identity";

export class DateSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = DateSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableDate,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
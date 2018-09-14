import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableDate} from "../observable/ObservableDate";

export class DateSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = DateSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableDate,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
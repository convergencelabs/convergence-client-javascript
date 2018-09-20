import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";

export class StringSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = StringSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableString,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";

export class StringRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = StringRemoveEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableString,
              public readonly index: number,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
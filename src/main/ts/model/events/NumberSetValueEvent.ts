import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";

export class NumberSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = NumberSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableNumber,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

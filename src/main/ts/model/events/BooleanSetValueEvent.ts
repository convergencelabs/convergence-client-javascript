import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableBoolean} from "../observable/ObservableBoolean";

export class BooleanSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = BooleanSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableBoolean,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

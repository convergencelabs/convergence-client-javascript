import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";

export class NumberDeltaEvent implements IValueChangedEvent {
  public static readonly NAME = "delta";
  public readonly name: string = NumberDeltaEvent.NAME;

  /**
   * @param element
   * @param value
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableNumber,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";

export class ArraySetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ArraySetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableArray,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

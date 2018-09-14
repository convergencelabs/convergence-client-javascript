import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";

export class ArrayRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = ArrayRemoveEvent.NAME;

  /**
   * @param element
   * @param index
   * @param oldValue
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableArray,
              public readonly index: number,
              public readonly oldValue: ObservableElement<any>,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

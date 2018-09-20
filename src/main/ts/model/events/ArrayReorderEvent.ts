import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";

export class ArrayReorderEvent implements IValueChangedEvent {
  public static readonly NAME = "reorder";
  public readonly name: string = ArrayReorderEvent.NAME;

  /**
   * @param element
   * @param fromIndex
   * @param toIndex
   * @param sessionId
   * @param username
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableArray,
              public readonly fromIndex: number,
              public readonly toIndex: number,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
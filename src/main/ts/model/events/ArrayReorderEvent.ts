import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {DomainUser} from "../../identity";

export class ArrayReorderEvent implements IValueChangedEvent {
  public static readonly NAME = "reorder";
  public readonly name: string = ArrayReorderEvent.NAME;

  /**
   * @param element
   * @param fromIndex
   * @param toIndex
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableArray,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly fromIndex: number,
              public readonly toIndex: number) {
    Object.freeze(this);
  }
}
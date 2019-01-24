import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

export class ArrayInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";
  public readonly name: string = ArrayInsertEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
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
              public readonly index: number,
              public readonly value: ObservableElement<any>) {
    Object.freeze(this);
  }
}

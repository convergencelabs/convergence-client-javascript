import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

export class ArraySetEvent implements IValueChangedEvent {
  public static readonly NAME = "set";
  public readonly name: string = ArraySetEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param oldValue
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
              public readonly value: ObservableElement<any>,
              public readonly oldValue: ObservableElement<any>) {
    Object.freeze(this);
  }
}
import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

export class StringInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";
  public readonly name: string = StringInsertEvent.NAME;

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
  constructor(public readonly element: ObservableString,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly index: number,
              public readonly value: string) {
    Object.freeze(this);
  }
}
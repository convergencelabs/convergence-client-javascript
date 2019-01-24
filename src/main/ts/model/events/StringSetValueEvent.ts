import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

export class StringSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = StringSetValueEvent.NAME;

  /**
   * @param element
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
              public readonly local: boolean,) {
    Object.freeze(this);
  }
}

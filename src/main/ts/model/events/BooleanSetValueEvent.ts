import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableBoolean} from "../observable/ObservableBoolean";
import {DomainUser} from "../../identity";

export class BooleanSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = BooleanSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableBoolean,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

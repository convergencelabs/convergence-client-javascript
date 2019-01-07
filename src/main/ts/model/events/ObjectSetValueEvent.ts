import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";
import {DomainUser} from "../../identity";

export class ObjectSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ObjectSetValueEvent.NAME;

  /**
   * @param element
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(public readonly element: ObservableObject,
              public readonly user: DomainUser,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

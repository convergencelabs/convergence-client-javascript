import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

export class ObjectSetEvent implements IValueChangedEvent {
  public static readonly NAME = "set";
  public readonly name: string = ObjectSetEvent.NAME;

  /**
   * @param element
   * @param key
   * @param value
   * @param oldValue
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
              public readonly local: boolean,
              public readonly key: string,
              public readonly value: ObservableElement<any>,
              public readonly oldValue: ObservableElement<any>) {
    Object.freeze(this);
  }
}

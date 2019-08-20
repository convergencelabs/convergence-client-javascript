import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

export class ObjectSetEvent implements IValueChangedEvent {
  public static readonly NAME = "set";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
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
  constructor(
    public readonly element: ObservableObject,
    public readonly user: DomainUser,
    public readonly sessionId: string,
    public readonly local: boolean,
    public readonly key: string,
    public readonly value: ObservableElement<any>,
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}

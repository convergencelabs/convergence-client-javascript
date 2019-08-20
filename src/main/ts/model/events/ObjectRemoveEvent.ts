import {IValueChangedEvent} from "../index";
import {ObservableObject} from "../observable/ObservableObject";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

export class ObjectRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ObjectRemoveEvent.NAME;

  /**
   * @param element
   * @param key
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
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}

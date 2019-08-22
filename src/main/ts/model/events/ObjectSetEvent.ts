import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableObject} from "../observable/ObservableObject";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a key-value pair is set on a [[RealTimeObject]].
 */
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
    /**
     * A read-only representation of the [[RealTimeObject]] which was modified
     */
    public readonly element: ObservableObject,

    /**
     * The user which performed the modification
     */
    public readonly user: DomainUser,

    /**
     * The sessionId corresponding to the session that performed the modification
     */
    public readonly sessionId: string,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * The new key that was added.
     */
    public readonly key: string,

    /**
     * A read-only representation of the value that was added.
     */
    public readonly value: ObservableElement<any>,

    /**
     * The detached [[RealTimeElement]] that used to be `key`'s value, or [[RealTimeUndefined]]
     * if this is a new key-value pair.
     */
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}

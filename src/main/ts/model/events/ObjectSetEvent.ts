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
   * @inheritdoc
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
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
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

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is set on a [[RealTimeArray]].
 */
export class ArraySetEvent implements IValueChangedEvent {
  public static readonly NAME = "set";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
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
  constructor(
    /**
     * A read-only representation of the [[RealTimeArray]] which was modified
     */
    public readonly element: ObservableArray,
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
     * The index at whose value was set (replaced)
     */
    public readonly index: number,

    /**
     * A read-only representation of the new value
     */
    public readonly value: ObservableElement<any>,

    /**
     * A read-only representation of the previous value at this index, which has been
     * replaced by `value`
     */
    public readonly oldValue: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}

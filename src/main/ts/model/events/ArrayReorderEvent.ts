import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {DomainUser} from "../../identity";

/**
 * Emitted when an element is reordered from a [[RealTimeArray]].
 *
 * The value that was moved can be found at [[toIndex]].
 */
export class ArrayReorderEvent implements IValueChangedEvent {
  public static readonly NAME = "reorder";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ArrayReorderEvent.NAME;

  /**
   * @param element
   * @param fromIndex
   * @param toIndex
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
     * The prior index of the moved element
     */
    public readonly fromIndex: number,

    /**
     * The new index of the element, whose value can be accessed by `element.get(toIndex)`
     */
    public readonly toIndex: number
  ) {
    Object.freeze(this);
  }
}

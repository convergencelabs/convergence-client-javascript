import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {DomainUser} from "../../identity";

/**
 * Emitted when the entire [[RealTimeArray.value|value]] of a [[RealTimeArray]] is set,
 * meaning its entire contents were replaced (or initially set)
 */
export class ArraySetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ArraySetValueEvent.NAME;

  /**
   * @param element
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
    public readonly local: boolean
  ) {
    Object.freeze(this);
  }
}

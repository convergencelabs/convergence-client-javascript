import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableBoolean} from "../observable/ObservableBoolean";
import {DomainUser} from "../../identity";

/**
 * Emitted when the [[RealTimeBoolean.value]] of a [[RealTimeBoolean]] is set.
 */
export class BooleanSetValueEvent implements IValueChangedEvent {
  public static readonly NAME = "value";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
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
  constructor(
    /**
     * A read-only representation of the [[RealTimeBoolean]] which was modified
     */
    public readonly element: ObservableBoolean,

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

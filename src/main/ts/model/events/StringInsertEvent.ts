import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more characters are added to a [[RealTimeString]].
 */
export class StringInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = StringInsertEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * A read-only representation of the [[RealTimeString]] which was modified
     */
    public readonly element: ObservableString,

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
     * The index at which the insertion happened
     */
    public readonly index: number,

    /**
     * The substring that was inserted
     */
    public readonly value: string
  ) {
    Object.freeze(this);
  }
}

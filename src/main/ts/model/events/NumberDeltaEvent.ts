import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

/**
 * Emitted when arithmetic is performed on a [[RealTimeNumber]].
 *
 * When the value of a [[RealTimeNumber]] is directly set
 * (with e.g. `rtNumber.value(23)`), a [[NumberSetValueEvent]] is emitted.
 */
export class NumberDeltaEvent implements IValueChangedEvent {
  public static readonly NAME = "delta";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = NumberDeltaEvent.NAME;

  /**
   * @param element
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
     * A read-only representation of the [[RealTimeNumber]] which was modified
     */
    public readonly element: ObservableNumber,

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
     * The new value of the number
     */
    public readonly value: number
  ) {
    Object.freeze(this);
  }
}

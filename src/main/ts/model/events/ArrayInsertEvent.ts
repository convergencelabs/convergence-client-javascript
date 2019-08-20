import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is inserted into a [[RealTimeArray]].  This could be from a
 * [[RealTimeArray.insert]], [[RealTimeArray.push]], [[RealTimeArray.unshift]], or some
 * other method.
 */
export class ArrayInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ArrayInsertEvent.NAME;

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
     * The index at which the new value was inserted
     */
    public readonly index: number,

    /**
     * A read-only representation of the value that was just inserted
     */
    public readonly value: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}

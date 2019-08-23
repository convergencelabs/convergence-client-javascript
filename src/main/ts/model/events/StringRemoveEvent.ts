import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more characters were removed from a [[RealTimeString]].
 * See [[RealTimeString.remove]]
 *
 * In this example, note the properties that get printed out in the event subscription:
 *
 * ```typescript
 * model.emitLocalEvents(true);
 *
 * let rtStr = model.elementAt('foo');
 * rtStr.value() // "bar"
 *
 * rtStr.events().subscribe(function(e) {
 *   console.log('event name:', e.name);
 *   console.log('event local?', e.local);
 *   console.log('removed at index', e.index);
 *   console.log('removed value:', e.value);
 * });
 *
 * rtStr.remove(1, 2);
 * // event name: "remove"
 * // event local? true
 * // removed at index 1
 * // removed value: "ar"
 * ```
 */
export class StringRemoveEvent implements IValueChangedEvent {
  public static readonly NAME = "remove";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = StringRemoveEvent.NAME;

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
     * The index at which the character(s) were removed
     */
    public readonly index: number,

    /**
     * The actual substring that was removed
     */
    public readonly value: string
  ) {
    Object.freeze(this);
  }
}

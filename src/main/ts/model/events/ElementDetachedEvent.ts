import {IConvergenceEvent} from "../../util";
import {ObservableElement} from "../observable/ObservableElement";

/**
 * Emitted when an element becomes detached.  This typically happens when the element
 * is removed from its parent.
 */
export class ElementDetachedEvent implements IConvergenceEvent {
  public static readonly NAME = "detached";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ElementDetachedEvent.NAME;

  /**
   * @param src
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * A read-only representation of the [[RealTimeElement]] that was detached.
     */
    public readonly src: ObservableElement<any>
  ) { }
}

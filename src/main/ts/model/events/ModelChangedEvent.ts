import {IConvergenceModelValueEvent} from "./IConvergenceModelValueEvent";
import {ObservableElement} from "../observable/ObservableElement";
import {Path} from "../Path";
import {IValueChangedEvent} from "./IValueChangedEvent";
import {DomainUser} from "../../identity";

/**
 * The [[ModelChangedEvent]] is fired by a [[ObservableElement]] when a child
 * element has a change.  This is a convenience event which you can listen to e.g.
 * within a [[RealTimeContainerElement]] when you'd like to know about *any* changes
 * to the data within.
 */
export class ModelChangedEvent implements IConvergenceModelValueEvent {
  public static readonly NAME = "model_changed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelChangedEvent.NAME;

  /**
   * @param element
   * @param relativePath
   * @param childEvent
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * A read-only representation of the [[RealTimeElement]] from which this event was emitted.
     */
    public readonly element: ObservableElement<any>,

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
     * The [[Path]] of the [[RealTimeElement]] on which the specific event occurred.
     */
    public readonly relativePath: Path,

    /**
     * The actual, more granular event.
     */
    public readonly childEvent: IValueChangedEvent
  ) {
    Object.freeze(this);
  }
}

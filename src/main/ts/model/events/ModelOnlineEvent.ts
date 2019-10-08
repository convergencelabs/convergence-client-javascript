import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] goes online after being offline. Subscribe
 * to this directly on a [[RealTimeModel]] rather than a [[RealTimeElement]]
 * within.
 *
 * @category Real Time Data Subsystem
 */
export class ModelOnlineEvent implements IModelEvent {
  public static readonly NAME = "online";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelOnlineEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that came online.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}

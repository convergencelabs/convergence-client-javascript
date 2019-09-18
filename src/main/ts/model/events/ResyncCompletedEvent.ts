import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] reconnects to the server and when the
 * resynchronization process completes.
 */
export class ResyncCompletedEvent implements IModelEvent {
  public static readonly NAME = "resync_completed";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ResyncCompletedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] whose version just changed
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] reconnects to the server and when the
 * resynchronization process starts.
 */
export class ResyncStartedEvent implements IModelEvent {
  public static readonly NAME = "resync_started";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ResyncStartedEvent.NAME;

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

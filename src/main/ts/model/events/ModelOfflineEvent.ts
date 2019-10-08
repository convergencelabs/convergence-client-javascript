import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] goes offline, generally because the client
 * lost connectivity to the server.  The event is emitted after the model
 * reconnects and the resynchronization process completes. Subscribe to this
 * directly on a [[RealTimeModel]] rather than a [[RealTimeElement]] within.
 */
export class ModelOfflineEvent implements IModelEvent {
  public static readonly NAME = "offline";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelOfflineEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that just went offline.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}

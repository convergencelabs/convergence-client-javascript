import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] is attempting to reconnect to the server
 * after being offline.
 *
 * @category Real Time Data Subsystem
 */
export class ModelReconnectingEvent implements IModelEvent {
  public static readonly NAME = "reconnecting";

  /**
   * The name of this event type.  This can be used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelReconnectingEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that is reconnecting
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}

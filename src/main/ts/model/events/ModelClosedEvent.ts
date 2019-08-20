import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * The [[ModelClosedEvent]] is fired when a Model is closed either by the
 * client or the server.
 */
export class ModelClosedEvent implements IModelEvent {
  public static readonly NAME = "closed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelClosedEvent.NAME;

  /**
   * @param src
   * @param local
   * @param reason
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * A read-only representation of the [[RealTimeModel]] which was closed.
     */
    public readonly src: ObservableModel,

    /**
     * True if this change occurred locally (in the current session)
     */
    public readonly local: boolean,

    /**
     * In the event that the model was closed by the server, a reason may be provided.
     */
    public readonly reason?: string
  ) {
    Object.freeze(this);
  }
}

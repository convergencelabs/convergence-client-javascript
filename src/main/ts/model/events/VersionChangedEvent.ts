import {IModelEvent} from "./IModelEvent";
import {ObservableModel} from "../observable/ObservableModel";

/**
 * Emitted when a [[RealTimeModel]]'s version changes.  Subscribe to this directly
 * on a [[RealTimeModel]] rather than a [[RealTimeElement]] within.
 *
 * Note that on a local change, this won't be fired until the version is updated on the
 * server and a response message sent back to the client.
 */
export class VersionChangedEvent implements IModelEvent {
  public static readonly NAME = "version_changed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = VersionChangedEvent.NAME;

  /**
   * @param src
   * @param version
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] whose version just changed
     */
    public readonly src: ObservableModel,

    /**
     * The new version of the model
     */
    public readonly version: number
  ) {
    Object.freeze(this);
  }
}

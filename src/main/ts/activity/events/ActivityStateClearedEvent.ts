import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

/**
 * The ActivityStateClearedEvent is fired when a remote session clears all an
 * of its state within the [[Activity]].
 */
export class ActivityStateClearedEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_cleared";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateClearedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritDoc
     */
    public readonly activity: Activity,
    /**
     * @inheritDoc
     */
    public readonly username: string,
    /**
     * @inheritDoc
     */
    public readonly sessionId: string,
    /**
     * @inheritDoc
     */
    public readonly local: boolean) {
    Object.freeze(this);
  }
}

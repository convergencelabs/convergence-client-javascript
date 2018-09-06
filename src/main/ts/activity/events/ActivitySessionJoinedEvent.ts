import {ActivityParticipant} from "../ActivityParticipant";
import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

/**
 * The ActivitySessionJoinedEvent is fired when a remote session joins an
 * Activity.
 */
export class ActivitySessionJoinedEvent implements IActivityEvent {
  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "session_joined";

  /**
   * @inheritdoc
   */
  public readonly name: string = ActivitySessionJoinedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritdoc
     */
    public readonly activity: Activity,
    /**
     * @inheritdoc
     */
    public readonly username: string,
    /**
     * @inheritdoc
     */
    public readonly sessionId: string,
    /**
     * @inheritdoc
     */
    public readonly local: boolean,
    /**
     * @inheritdoc
     */
    public readonly participant: ActivityParticipant) {
    Object.freeze(this);
  }
}

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivitySessionLeftEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "session_left";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivitySessionLeftEvent.EVENT_NAME;

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
    public readonly local: boolean) {
    Object.freeze(this);
  }
}

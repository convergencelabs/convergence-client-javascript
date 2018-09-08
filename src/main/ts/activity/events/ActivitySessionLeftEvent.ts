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

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateClearedEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_cleared";
  public readonly name: string = ActivityStateClearedEvent.EVENT_NAME;

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

import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateRemovedEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_removed";
  public readonly name: string = ActivityStateRemovedEvent.EVENT_NAME;

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
     * @param The key of the state that was removed.
     */
    public readonly key: string) {
    Object.freeze(this);
  }
}

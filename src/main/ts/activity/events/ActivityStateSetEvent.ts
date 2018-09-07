import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateSetEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_set";
  public readonly name: string = ActivityStateSetEvent.EVENT_NAME;

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
     * @param The key of the state value that was set.
     */
    public readonly key: string,
    /**
     * @param The value that was set
     */
    public readonly value: string) {
    Object.freeze(this);
  }
}

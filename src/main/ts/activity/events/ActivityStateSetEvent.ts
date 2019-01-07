import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivityStateSetEvent is fired when a remote session sets one or
 * elements from its state within the [[Activity]].
 */
export class ActivityStateSetEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_set";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateSetEvent.EVENT_NAME;

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
    public readonly user: DomainUser,
    /**
     * @inheritDoc
     */
    public readonly sessionId: string,
    /**
     * @inheritDoc
     */
    public readonly local: boolean,
    /**
     * The key of the state delta that was set.
     */
    public readonly key: string,
    /**
     * The delta that was set
     */
    public readonly value: string) {
    Object.freeze(this);
  }
}

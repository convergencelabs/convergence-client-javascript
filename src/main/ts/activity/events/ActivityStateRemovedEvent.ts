import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

/**
 * The ActivityStateRemovedEvent is fired when a remote session removes one or
 * elements from its state within the [[Activity]].
 */
export class ActivityStateRemovedEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "state_removed";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityStateRemovedEvent.EVENT_NAME;

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
    public readonly local: boolean,
    /**
     * The key of the state that was removed.
     */
    public readonly key: string) {
    Object.freeze(this);
  }
}

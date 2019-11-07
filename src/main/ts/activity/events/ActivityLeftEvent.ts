import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";
import {DomainUser} from "../../identity";

/**
 * The ActivityStateClearedEvent is fired when a remote session clears all an
 * of its state within the [[Activity]].
 *
 * @module Collaboration Awareness
 */
export class ActivityLeftEvent implements IActivityEvent {

  /**
   * The event name that all instances of this class will use.
   */
  public static readonly EVENT_NAME: string = "left";

  /**
   * @inheritDoc
   */
  public readonly name: string = ActivityLeftEvent.EVENT_NAME;

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
    public readonly local: boolean) {
    Object.freeze(this);
  }
}

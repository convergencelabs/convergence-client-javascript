import {Activity} from "../Activity";
import {IConvergenceEvent} from "../../util/";

/**
 * IActivityEvent is the base interface for all events fired by the Activity
 * subsystem. All Activity events will implement this interface.
 */
export interface IActivityEvent extends IConvergenceEvent {
  /**
   * The Activity that this event relates to.
   */
  readonly activity: Activity;

  /**
   * The username of the user originated this event.
   */
  readonly username: string;

  /**
   * The session id of the session that originated this event.
   */
  readonly sessionId: string;

  /**
   * Will be true if this event is from the local user / session;
   * false otherwise.
   */
  readonly local: boolean;
}

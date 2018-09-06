import {deepClone} from "../util/ObjectUtils";
import {Activity} from "./Activity";

/**
 * The ActivityParticipant represents an individual user session that has
 * joined a particular [[Activity]].
 */
export class ActivityParticipant {

  /**
   * @internal
   */
  private readonly _state: Map<string, any>;

  /**
   * @param activity
   *   The [[Activity]] this participant belongs too.
   * @param sessionId
   *   The session id of the participant.
   * @param username
   *   The username of the participant.
   * @param local
   *   A flag indicating if the participant represents the local user /
   *   session.
   * @param state
   *   The state of this participant within the activity.
   *
   * @hidden
   * @internal
   */
  constructor(public readonly activity: Activity,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean,
              state: Map<string, any>) {
    this._state = deepClone(state);
    Object.freeze(this);
  }

  /**
   * @returns
   *   The current state of this participant within this activity.
   */
  public get state(): Map<string, any> {
    return deepClone(this._state);
  }
}

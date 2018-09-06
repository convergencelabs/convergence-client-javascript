import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivitySessionLeftEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "session_left";
  public readonly name: string = ActivitySessionLeftEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

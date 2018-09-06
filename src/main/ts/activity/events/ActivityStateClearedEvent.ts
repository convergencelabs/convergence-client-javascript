import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateClearedEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_cleared";
  public readonly name: string = ActivityStateClearedEvent.EVENT_NAME;

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

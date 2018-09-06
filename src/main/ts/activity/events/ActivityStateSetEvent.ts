import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateSetEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_set";
  public readonly name: string = ActivityStateSetEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly key: string,
              public readonly value: string) {
    Object.freeze(this);
  }
}

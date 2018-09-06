import {Activity} from "../Activity";
import {IActivityEvent} from "./IActivityEvent";

export class ActivityStateRemovedEvent implements IActivityEvent {
  public static readonly EVENT_NAME: string = "state_removed";
  public readonly name: string = ActivityStateRemovedEvent.EVENT_NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly key: string) {
    Object.freeze(this);
  }
}

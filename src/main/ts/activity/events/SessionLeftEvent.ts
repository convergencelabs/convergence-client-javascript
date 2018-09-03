import {Activity} from "../Activity";
import {ActivityEvent} from "./ActivityEvent";
import {ActivityEvents} from "./ActivityEvents";

export class SessionLeftEvent implements ActivityEvent {
  public static readonly NAME = ActivityEvents.SESSION_LEFT;
  public readonly name: string = SessionLeftEvent.NAME;

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

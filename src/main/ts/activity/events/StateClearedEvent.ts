import {Activity} from "../Activity";
import {ActivityEvent} from "./ActivityEvent";
import {ActivityEvents} from "./ActivityEvents";

export class StateClearedEvent implements ActivityEvent {
  public static readonly NAME = ActivityEvents.STATE_CLEARED;
  public readonly name: string = StateClearedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

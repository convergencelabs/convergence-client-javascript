import {Activity} from "../Activity";
import {ActivityEvent} from "./ActivityEvent";
import {ActivityEvents} from "./ActivityEvents";

export class StateRemovedEvent implements ActivityEvent {
  public static readonly NAME = ActivityEvents.STATE_REMOVED;
  public readonly name: string = StateRemovedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly key: string) {
    Object.freeze(this);
  }
}

import {Activity} from "../Activity";
import {ActivityEvent} from "./ActivityEvent";
import {ActivityEvents} from "./ActivityEvents";

export class StateSetEvent implements ActivityEvent {
  public static readonly NAME = ActivityEvents.STATE_SET;
  public readonly name: string = StateSetEvent.NAME;

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

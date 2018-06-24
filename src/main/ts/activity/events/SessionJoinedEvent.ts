import {ActivityParticipant} from "../ActivityParticipant";
import {Activity} from "../Activity";
import {ActivityEvent} from "./ActivityEvent";
import {ActivityEvents} from "./ActivityEvents";

export class SessionJoinedEvent implements ActivityEvent {
  public static readonly NAME = ActivityEvents.SESSION_JOINED;
  public readonly name: string = SessionJoinedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly participant: ActivityParticipant) {
    Object.freeze(this);
  }
}

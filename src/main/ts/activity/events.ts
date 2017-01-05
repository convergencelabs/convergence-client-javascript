import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityParticipant} from "./ActivityParticipant";

export interface ActivityEvent extends ConvergenceEvent {
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
}

export class SessionJoinedEvent implements ActivityEvent {
  public static readonly NAME = "session_joined";
  public name: string = SessionJoinedEvent.NAME;

  constructor(public activityId: string,
              public username: string,
              public sessionId: string,
              public local: boolean,
              public participant: ActivityParticipant) {
    Object.freeze(this);
  }
}

export class SessionLeftEvent implements ActivityEvent {
  public static readonly NAME = "session_left";
  public name: string = SessionLeftEvent.NAME;

  constructor(public activityId: string,
              public username: string,
              public sessionId: string,
              public local: boolean) {
    Object.freeze(this);
  }
}

export class StateSetEvent implements ActivityEvent {
  public static readonly NAME = "state_set";
  public name: string = StateSetEvent.NAME;

  constructor(public activityId: string,
              public username: string,
              public sessionId: string,
              public local: boolean,
              public key: string,
              public value: string) {
    Object.freeze(this);
  }
}

export class StateRemovedEvent implements ActivityEvent {
  public static readonly NAME = "state_removed";
  public name: string = StateRemovedEvent.NAME;

  constructor(public activityId: string,
              public username: string,
              public sessionId: string,
              public local: boolean,
              public key: string) {
    Object.freeze(this);
  }
}

export class StateClearedEvent implements ActivityEvent {
  public static readonly NAME = "state_cleared";
  public name: string = StateClearedEvent.NAME;

  constructor(public activityId: string,
              public username: string,
              public sessionId: string,
              public local: boolean) {
    Object.freeze(this);
  }
}

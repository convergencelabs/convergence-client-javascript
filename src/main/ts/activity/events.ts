import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityParticipant} from "./ActivityParticipant";
import {Activity} from "./Activity";

export interface ActivityEvent extends ConvergenceEvent {
  readonly activity: Activity;
  readonly username: string;
  readonly sessionId: string;
  readonly local: boolean;
}

export class SessionJoinedEvent implements ActivityEvent {
  public static readonly NAME = "session_joined";
  public readonly name: string = SessionJoinedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly participant: ActivityParticipant) {
    Object.freeze(this);
  }
}

export class SessionLeftEvent implements ActivityEvent {
  public static readonly NAME = "session_left";
  public readonly name: string = SessionLeftEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class StateSetEvent implements ActivityEvent {
  public static readonly NAME = "state_set";
  public readonly name: string = StateSetEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly key: string,
              public readonly value: string) {
    Object.freeze(this);
  }
}

export class StateRemovedEvent implements ActivityEvent {
  public static readonly NAME = "state_removed";
  public readonly name: string = StateRemovedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean,
              public readonly key: string) {
    Object.freeze(this);
  }
}

export class StateClearedEvent implements ActivityEvent {
  public static readonly NAME = "state_cleared";
  public readonly name: string = StateClearedEvent.NAME;

  constructor(public readonly activity: Activity,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

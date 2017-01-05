import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityParticipant} from "./ActivityParticipant";

export interface ActivityEvent extends ConvergenceEvent {
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
}

export declare class SessionJoinedEvent implements ActivityEvent {
  name: string;
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
  participant: ActivityParticipant;
}

export declare class SessionLeftEvent implements ActivityEvent {
  name: string;
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
}

export declare class StateSetEvent implements ActivityEvent {
  name: string;
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
  key: string;
  value: any;
}

export declare class StateClearedEvent implements ActivityEvent {
  name: string;
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
  key: string;
}

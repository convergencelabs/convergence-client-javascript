import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ActivityParticipant} from "./ActivityParticipant";

export interface ActivityEvent extends ConvergenceEvent {
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
}

export interface SessionJoinedEvent extends ActivityEvent {
  participant: ActivityParticipant;
}

export interface SessionLeftEvent extends ActivityEvent {
}

export interface StateSetEvent extends ActivityEvent {
  key: string;
  value: any;
}

export interface StateRemovedEvent extends ActivityEvent {
  key: string;
}

export interface StateClearedEvent extends ActivityEvent {
}

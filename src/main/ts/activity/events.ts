import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ActivityEvent extends ConvergenceEvent {
  activityId: string;
  username: string;
  sessionId: string;
  local: boolean;
}

export interface SessionJoinedEvent extends ActivityEvent {

}

export interface SessionLeftEvent extends ActivityEvent {
}

export interface StateSetEvent extends ActivityEvent {
  key: string;
  value: any;
}

export interface StateClearedEvent extends ActivityEvent {
  key: string;
}

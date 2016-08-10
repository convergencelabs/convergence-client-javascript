import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export interface ChatMessageEvent extends ChatEvent {
  message: string;
}

export interface UserJoinedEvent extends ChatEvent {
}

export interface UserLeftEvent extends ChatEvent {
}

export interface JoinedEvent extends ChatEvent {
}

export interface LeftEvent extends ChatEvent {
}

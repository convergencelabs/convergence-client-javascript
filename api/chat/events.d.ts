import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export declare class ChatMessageEvent implements ChatEvent {
  name: string;
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
  message: string;
}

export declare class  UserJoinedEvent implements ChatEvent {
  name: string;
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export declare class  UserLeftEvent implements ChatEvent {
  name: string;
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}
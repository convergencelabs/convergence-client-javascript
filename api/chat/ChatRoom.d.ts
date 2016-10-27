import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export declare class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {
  info(): RoomInfo;

  isJoined(): boolean;

  leave(): void;

  send(message: string): void;
}

export declare class RoomInfo {
  members(): ChatMember[];
  messageCount(): number;
  lastMessageTime(): number;
}

export declare class ChatMember {
  sessionId();
  username();
}

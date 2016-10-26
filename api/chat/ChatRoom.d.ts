import {ChatEvent} from "./events";
import {ObservableEventEmitter} from "../util/ObservableEventEmitter";

export declare class ChatRoom extends ObservableEventEmitter<ChatEvent> {
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

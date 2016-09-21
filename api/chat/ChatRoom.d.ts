import {Observable} from "rxjs/Observable";
import {ChatEvent} from "./events";
import {ObservableEventEmitter} from "../util/ObservableEventEmitter";

export declare class ChatRoom extends ObservableEventEmitter<ChatEvent> {
  info(): Observable<RoomInfo>;

  isJoined(): boolean;

  join(): void;

  leave(): void;

  send(message: string): void;
}

export declare class RoomInfo {
  sessions(): string[]; // fixme we have been using a RemoteSession class
  messageCount(): number;

  lastMessageTime(): number;
}

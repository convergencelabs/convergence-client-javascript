import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatMember} from "./ChatMember";

export interface ChatRoomEvents {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  JOINED: string;
  LEFT: string;
}

export declare class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatRoomEvents;

  public id(): string;

  public isJoined(): boolean;

  public leave(): void;

  public send(message: string): void;

  public members(): ChatMember[];

  public messageCount(): number;

  public lastMessageTime(): number;
}

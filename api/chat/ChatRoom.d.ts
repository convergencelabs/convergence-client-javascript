import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatMember} from "./ChatMember";

export interface ChatRoomEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
}

export declare class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatRoomEvents;

  public id(): string;

  public members(): ChatMember[];

  public messageCount(): number;

  public lastMessageTime(): number;

  public isJoined(): boolean;

  public leave(): void;

  public send(message: string): void;
}

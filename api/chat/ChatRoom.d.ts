import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatMember} from "./ChatMember";

export declare class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {
  id(): string;

  isJoined(): boolean;

  leave(): void;

  send(message: string): void;

  members(): ChatMember[];

  messageCount(): number;

  lastMessageTime(): number;
}

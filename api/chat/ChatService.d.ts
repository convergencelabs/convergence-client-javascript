import {Session} from "../Session";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
}

export declare class ChatService extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatServiceEvents;

  public session(): Session;

  public joinRoom(id: string): Promise<ChatRoom>;
}

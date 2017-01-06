import {Session} from "../Session";
import {Observable} from "rxjs/Rx";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";

export interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
}

export declare class ChatService {
  public static readonly Events: ChatServiceEvents;

  public session(): Session;

  public joinRoom(id: string): Promise<ChatRoom>;

  public events(): Observable<ChatEvent>;
}

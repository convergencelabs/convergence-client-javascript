import {Session} from "../Session";
import {Observable} from "rxjs/Rx";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";

export interface ChatServiceEvents {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  JOINED: string;
  LEFT: string;
}

export declare class ChatService {
  public static readonly Events: ChatServiceEvents;

  public session(): Session;

  public joinRoom(id: string): Promise<ChatRoom>;

  public events(): Observable<ChatEvent>;
}

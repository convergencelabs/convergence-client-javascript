import {Session} from "../Session";
import {Observable} from "rxjs/Rx";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";

export declare class ChatService {
  static Events: any;

  session(): Session;

  joinRoom(id: string): Promise<ChatRoom>;

  events(): Observable<ChatEvent>;
}

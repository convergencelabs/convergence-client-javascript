import {Session} from "../Session";
import {Observable} from "rxjs/Rx";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";

export declare class ChatService {
  static Events: any;

  session(): Session;

  room(id: string): ChatRoom;

  events(): Observable<ChatEvent>;
}

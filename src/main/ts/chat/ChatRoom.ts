import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import {ChatService} from "./ChatService";
import {ChatEvent} from "./events";

export class ChatRoom {

  static Events: any = ChatService.Events;

  private _id: string;
  private _joinCB: () => void;
  private _leftCB: () => void;
  private _isJoined: () => boolean;
  private _connection: ConvergenceConnection;
  private _eventStream: Observable<ChatEvent>;

  constructor(id: string,
              joinCB: () => void,
              leftCB: () => void,
              isJoined: () => boolean,
              eventStream: Observable<ChatEvent>,
              connection: ConvergenceConnection) {

    this._id = id;
    this._joinCB = joinCB;
    this._leftCB = leftCB;
    this._isJoined = isJoined;
    this._eventStream = eventStream;
    this._connection = connection;
  }

  info(): Observable<RoomInfo> {
    return Observable.create((observer) => observer.next(new RoomInfo([], 0, Date.now())));
  }

  isJoined(): boolean {
    return this._isJoined();
  }

  join(): void {
    if (!this._isJoined()) {
      this._joinCB();
    }
  }

  leave(): void {
    if (this._isJoined()) {
      this._leftCB();
    }
  }

  send(message: string): void {
    if (!this._isJoined()) {
      // TODO: Handle not joined error
    }
  }

  eventStream(): Observable<ChatEvent> {
    return this._eventStream;
  }
}

export class RoomInfo {
  private _sessions: string[];
  private _messageCount: number;
  private _lastMessageTime: number;

  constructor(sessions: string[], messageCount: number, lastMessageTime: number) {
    this._sessions = sessions;
    this._messageCount = messageCount;
    this._lastMessageTime = lastMessageTime;
  }

  sessions(): string[] {
    return this._sessions;
  }

  messageCount(): number {
    return this._messageCount;
  }

  lastMessageTime(): number {
    return this._lastMessageTime;
  }
}

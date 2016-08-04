import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";

export class ChatRoom {

  private _id: string;
  private _connection: ConvergenceConnection;
  private _eventStream: Observable<MessageEvent>;

  constructor(id: string, eventStream: Observable<MessageEvent>, connection: ConvergenceConnection) {
    this._id = id;
    this._eventStream = eventStream;
    this._connection = connection;
  }

  info(): Observable<RoomInfo> {
    return Observable.create((observer) => observer.next(new RoomInfo(true, [], 0, Date.now())));
  }

  join(): Observable<void> {
    return Observable.create((observer) => observer.next());
  }

  leave(): void {
  }

  send(message: string): void {
  }

  eventStream(): Observable<MessageEvent> {
    return this._eventStream;
  }
}

export class RoomInfo {

  private _isJoined: boolean;
  private _sessions: string[];
  private _messageCount: number;
  private _lastMessageTime: number;

  constructor(isJoined: boolean, sessions: string[], messageCount: number, lastMessageTime: number) {
    this._isJoined = isJoined;
    this._sessions = sessions;
    this._messageCount = messageCount;
    this._lastMessageTime = lastMessageTime;
  }

  isJoined(): boolean {
    return this._isJoined;
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

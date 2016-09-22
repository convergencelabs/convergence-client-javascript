import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import {ChatEvent} from "./events";
import {JoinRoomMessage} from "../connection/protocol/chat/joinRoom";
import {MessageType} from "../connection/protocol/MessageType";
import {LeaveRoomMessage} from "../connection/protocol/chat/leaveRoom";
import {PublishChatMessage} from "../connection/protocol/chat/chatMessage";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {

  private _id: string;
  private _joinCB: () => void;
  private _leftCB: () => void;
  private _isJoined: () => boolean;
  private _connection: ConvergenceConnection;

  constructor(id: string,
              joinCB: () => void,
              leftCB: () => void,
              isJoined: () => boolean,
              eventStream: Observable<ChatEvent>,
              connection: ConvergenceConnection) {
    super();
    this._emitFrom(eventStream);
    this._id = id;
    this._joinCB = joinCB;
    this._leftCB = leftCB;
    this._isJoined = isJoined;
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
      this._connection.send(<JoinRoomMessage>{
        type: MessageType.JOIN_ROOM,
        roomId: this._id
      });
      this._joinCB();
    }
  }

  leave(): void {
    if (this._isJoined()) {
      this._connection.send(<LeaveRoomMessage>{
        type: MessageType.LEAVE_ROOM,
        roomId: this._id
      });
      this._leftCB();
    }
  }

  send(message: string): void {
    if (!this._isJoined()) {
      // TODO: Handle not joined error
    }

    this._connection.send(<PublishChatMessage>{
      type: MessageType.PUBLISH_CHAT_MESSAGE,
      roomId: this._id,
      message: message
    });
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

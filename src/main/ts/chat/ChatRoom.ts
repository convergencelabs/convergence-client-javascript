import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import {ChatEvent} from "./events";
import {MessageType} from "../connection/protocol/MessageType";
import {LeaveRoomMessage} from "../connection/protocol/chat/leaveRoom";
import {PublishChatMessage} from "../connection/protocol/chat/chatMessage";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";

export class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {

  private _id: string;
  private _members: ChatMember[];
  private _messageCount: number;
  private _lastMessageTime: number;

  private _leftCB: () => void;
  private _joined: boolean;
  private _connection: ConvergenceConnection;

  constructor(id: string,
              members: ChatMember[],
              messageCount: number,
              lastMessageTime: number,
              leftCB: () => void,
              eventStream: Observable<ChatEvent>,
              connection: ConvergenceConnection) {
    super();
    this._emitFrom(eventStream);
    this._id = id;
    this._members = members;
    this._messageCount = messageCount;
    this._lastMessageTime = lastMessageTime;
    this._leftCB = leftCB;
    this._joined = true;
    this._connection = connection;


  }

  id(): string {
    return this._id;
  }

  members(): ChatMember[] {
    return this._members;
  }

  messageCount(): number {
    return this._messageCount;
  }

  lastMessageTime(): number {
    return this._lastMessageTime;
  }

  isJoined(): boolean {
    return this._joined;
  }

  leave(): void {
    if (this.isJoined()) {
      this._joined = false;
      this._connection.send(<LeaveRoomMessage>{
        type: MessageType.LEAVE_ROOM,
        roomId: this._id
      });
      this._leftCB();
    }
  }

  send(message: string): void {
    if (!this.isJoined()) {
      // TODO: Handle not joined error
    }

    this._connection.send(<PublishChatMessage>{
      type: MessageType.PUBLISH_CHAT_MESSAGE,
      roomId: this._id,
      message: message
    });
  }
}

export class ChatMember {

  private _username: string;
  private _sessionId: string;

  constructor(username: string, sessionId: string) {
    this._username = username;
    this._sessionId = sessionId;
    Object.freeze(this);
  }

  username(): string {
    return this._sessionId;
  }

  sessionId(): string {
    return this._username;
  }
}

import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import {ChatEvent, ChatMessageEvent, UserJoinedEvent, UserLeftEvent} from "./events";
import {MessageType} from "../connection/protocol/MessageType";
import {LeaveRoomMessage} from "../connection/protocol/chat/leaveRoom";
import {PublishChatMessage} from "../connection/protocol/chat/chatMessage";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatMember} from "./ChatMember";

export interface ChatRoomEvents {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
}

export class ChatRoom extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatRoomEvents = {
    MESSAGE: ChatMessageEvent.NAME,
    USER_JOINED: UserJoinedEvent.NAME,
    USER_LEFT: UserLeftEvent.NAME
  };

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

  public id(): string {
    return this._id;
  }

  public members(): ChatMember[] {
    return this._members;
  }

  public messageCount(): number {
    return this._messageCount;
  }

  public lastMessageTime(): number {
    return this._lastMessageTime;
  }

  public isJoined(): boolean {
    return this._joined;
  }

  public leave(): void {
    if (this.isJoined()) {
      this._joined = false;
      this._connection.send(<LeaveRoomMessage> {
        type: MessageType.LEAVE_ROOM,
        roomId: this._id
      });
      this._leftCB();
    }
  }

  public send(message: string): void {
    if (!this.isJoined()) {
      // TODO: Handle not joined error
    }

    this._connection.send(<PublishChatMessage> {
      type: MessageType.PUBLISH_CHAT_MESSAGE,
      roomId: this._id,
      message
    });
  }
}
Object.freeze(ChatRoom.Events);

import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/bindCallback";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/filter';
import {MessageType} from "../connection/protocol/MessageType";
import {ChatRoom} from "./ChatRoom";
import {EventKey} from "../util/EventEmitter";
import {UserJoinedRoomMessage} from "../connection/protocol/chat/joinRoom";
import {UserLeftRoomMessage} from "../connection/protocol/chat/leaveRoom";
import {UserChatMessage} from "../connection/protocol/chat/chatMessage";
import {ChatMessageEvent, UserLeftEvent, ChatEvent, UserJoinedEvent} from "./events";

export class ChatService {

  static Events: any = {
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    JOINED: "joined",
    LEFT: "left",
  };

  private _connection: ConvergenceConnection;
  private _eventStream: Observable<ChatEvent>;
  private _joinedMap: Map<string, boolean>;


  constructor(connection: ConvergenceConnection) {
    this._connection = connection;

    var multiMessageListener: (types: EventKey[]) => Observable<MessageEvent> =
      Observable.bindCallback(this._connection.addMultipleMessageListener);

    // TODO: Change Message Types
    this._eventStream = multiMessageListener(
      [MessageType.USER_JOINED_ROOM,
        MessageType.USER_LEFT_ROOM,
        MessageType.CHAT_MESSAGE_PUBLISHED]
    ).pluck("message").map(message => {
      let msg: any = message;
      switch (msg.type) {
        case MessageType.USER_JOINED_ROOM:
          let joinedMsg: UserJoinedRoomMessage = <UserJoinedRoomMessage> message;
          return <UserJoinedEvent> {
            roomId: joinedMsg.roomId,
            username: joinedMsg.username,
            sessionId: joinedMsg.sessionId,
            timestamp: joinedMsg.timestamp
          };
        case MessageType.USER_LEFT_ROOM:
          let leftMsg: UserLeftRoomMessage = <UserLeftRoomMessage> message;
          return <UserLeftEvent> {
            roomId: leftMsg.roomId,
            username: leftMsg.username,
            sessionId: leftMsg.sessionId,
            timestamp: leftMsg.timestamp
          };
        case MessageType.CHAT_MESSAGE_PUBLISHED:
          let chatMsg: UserChatMessage = <UserChatMessage> message;
          return <ChatMessageEvent> {
            roomId: chatMsg.roomId,
            username: chatMsg.username,
            sessionId: chatMsg.sessionId,
            timestamp: chatMsg.timestamp,
            message: chatMsg.message
          };
        default:
        // This should be impossible
      }
    });

    this._joinedMap = new Map<string, boolean>();
  }

  session(): Session {
    return this._connection.session();
  }

  room(id: string): ChatRoom {
    return new ChatRoom(id,
      this._joinCB(id), this._leftCB(id), this._isJoined(id),
      this._eventStream.filter(event => {
        return event.roomId === id;
      }),
      this._connection);
  }

  eventStream(): Observable<ChatEvent> {
    return this._eventStream;
  }

  private _joinCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.set(id, true);
  };

  private _leftCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.delete(id);
  };

  private _isJoined: (id: string) => () => boolean = (id: string) => {
    return () => this._joinedMap.has(id);
  };
}

import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Rx";
import {MessageType} from "../connection/protocol/MessageType";
import {ChatRoom} from "./ChatRoom";
import {UserJoinedRoomMessage} from "../connection/protocol/chat/joinRoom";
import {UserLeftRoomMessage} from "../connection/protocol/chat/leaveRoom";
import {UserChatMessage} from "../connection/protocol/chat/chatMessage";
import {ChatMessageEvent, UserLeftEvent, UserJoinedEvent} from "./events";
import {Deferred} from "../util/Deferred";
import {JoinRoomRequestMessage} from "../connection/protocol/chat/joinRoom";
import {JoinRoomResponseMessage} from "../connection/protocol/chat/joinRoom";
import {SessionIdParser} from "../connection/protocol/SessionIdParser";
import {ChatMember} from "./ChatRoom";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatEvent} from "./events";

export class ChatService extends ConvergenceEventEmitter<ChatEvent> {

  public static Events: any = {
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    JOINED: "joined",
    LEFT: "left",
  };

  private _connection: ConvergenceConnection;
  private _joinedMap: Map<string, Deferred<ChatRoom>>;

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;

    let messageObs: Observable<MessageEvent> = Observable.create(observer => {
      this._connection.addMultipleMessageListener([MessageType.USER_JOINED_ROOM,
        MessageType.USER_LEFT_ROOM,
        MessageType.CHAT_MESSAGE_PUBLISHED], (event) => {
        observer.next(event);
      });
    });

    let eventStream: Observable<ChatEvent> = messageObs.pluck("message").map(message => {
      let msg: any = message;
      switch (msg.type) {
        case MessageType.USER_JOINED_ROOM:
          let joinedMsg: UserJoinedRoomMessage = <UserJoinedRoomMessage> message;
          return <UserJoinedEvent> {
            name: ChatService.Events.USER_JOINED,
            roomId: joinedMsg.roomId,
            username: joinedMsg.username,
            sessionId: joinedMsg.sessionId,
            timestamp: joinedMsg.timestamp
          };
        case MessageType.USER_LEFT_ROOM:
          let leftMsg: UserLeftRoomMessage = <UserLeftRoomMessage> message;
          return <UserLeftEvent> {
            name: ChatService.Events.USER_LEFT,
            roomId: leftMsg.roomId,
            username: leftMsg.username,
            sessionId: leftMsg.sessionId,
            timestamp: leftMsg.timestamp
          };
        case MessageType.CHAT_MESSAGE_PUBLISHED:
          let chatMsg: UserChatMessage = <UserChatMessage> message;
          return <ChatMessageEvent> {
            name: ChatService.Events.MESSAGE,
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

    this._emitFrom(eventStream);

    this._joinedMap = new Map<string, Deferred<ChatRoom>>();
  }

  public session(): Session {
    return this._connection.session();
  }

  public joinRoom(id: string): Promise<ChatRoom> {
    if (!this._joinedMap.has(id)) {
      this._joinedMap.set(id, new Deferred<ChatRoom>());

      this._connection.request(<JoinRoomRequestMessage> {
        type: MessageType.JOIN_ROOM_REQUEST,
        roomId: id
      }).then((response: JoinRoomResponseMessage) => {
        this._joinedMap.get(id).resolve(new ChatRoom(id,
          response.members.map(sessionId => {
            return new ChatMember(SessionIdParser.parseUsername(sessionId), sessionId);
          }),
          response.messageCount,
          response.lastMessageTime,
          this._leftCB(id),
          this.events().filter(event => {
            return event.roomId === id;
          }), this._connection));
      });
    }

    return this._joinedMap.get(id).promise();
  }

  private _leftCB: (id: string) => () => void = (id: string) => {
    return () => this._joinedMap.delete(id);
  };
}

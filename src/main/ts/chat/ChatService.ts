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
import {ChatMember} from "./ChatMember";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatEvent} from "./events";

export interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
}

export class ChatService extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatServiceEvents = {
    MESSAGE: ChatMessageEvent.NAME,
    USER_JOINED: UserJoinedEvent.NAME,
    USER_LEFT: UserLeftEvent.NAME
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
      const msg: any = message;
      switch (msg.type) {
        case MessageType.USER_JOINED_ROOM:
          const joinedMsg: UserJoinedRoomMessage = <UserJoinedRoomMessage> message;
          return new UserJoinedEvent(
            joinedMsg.roomId,
            joinedMsg.username,
            joinedMsg.sessionId,
            joinedMsg.timestamp
        );
        case MessageType.USER_LEFT_ROOM:
          const leftMsg: UserLeftRoomMessage = <UserLeftRoomMessage> message;
          return new UserLeftEvent(
            leftMsg.roomId,
            leftMsg.username,
            leftMsg.sessionId,
            leftMsg.timestamp
        );
        case MessageType.CHAT_MESSAGE_PUBLISHED:
          const chatMsg: UserChatMessage = <UserChatMessage> message;
          return new ChatMessageEvent(
            chatMsg.roomId,
            chatMsg.username,
            chatMsg.sessionId,
            chatMsg.timestamp,
            chatMsg.message
        );
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
  }
}
Object.freeze(ChatService.Events);

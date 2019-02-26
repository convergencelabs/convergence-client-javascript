import {ConvergenceEventEmitter} from "../util/";
import {
  ChatNameChanged,
  IChatEvent,
  ChatTopicChanged,
  ChatMessageEvent,
  ChatEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent
} from "./events/";
import {ChatType} from "./ChatService";
import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ChatHistoryEntry} from "./ChatHistoryEntry";
import {Observable} from "rxjs";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {ChatHistoryEventMapper} from "./ChatHistoryEventMapper";
import {getOrDefaultArray, toOptional} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUser} from "../identity";
import {ChatMembership} from "./MembershipChat";

export interface ChatInfo {
  readonly chatType: ChatType;
  readonly chatId: string;
  readonly membership: ChatMembership;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEventNumber: number;
  readonly members: ChatMember[];
}

export interface ChatMember {
  readonly user: DomainUser;
  readonly maxSeenEventNumber: number;
}

export interface ChatEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
}

const Events: ChatEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedEvent.NAME,
  USER_LEFT: UserLeftEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
};
Object.freeze(Events);

export abstract class Chat extends ConvergenceEventEmitter<IChatEvent> {
  public static readonly Events: ChatEvents = Events;

  /**
   * @internal
   */
  protected _info: ChatInfo;

  /**
   * @internal
   */
  protected _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private _identityCache: IdentityCache;

  /**
   * @internal
   */
  private _joined: boolean;

  /**
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
                        identityCache: IdentityCache,
                        messageStream: Observable<IChatEvent>,
                        info: ChatInfo) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._info = info;

    // TODO this might not make sense for rooms
    this._joined = info.members
      .map(m => m.user.userId)
      .findIndex(userId => this.session().user().userId.equals(userId)) >= 0;

    messageStream.subscribe(event => {
      this._processEvent(event);
      this._emitEvent(event);
    });
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  public info(): ChatInfo {
    return {...this._info};
  }

  public isJoined(): boolean {
    return this._joined;
  }

  public send(message: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      publishChatMessageRequest: {
        chatId: this._info.chatId,
        message
      }
    }).then(() => {
      return;
    });
  }

  public setName(name: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      setChatNameRequest: {
        chatId: this._info.chatId,
        name
      }
    }).then(() => {
      return;
    });
  }

  public setTopic(topic: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      setChatTopicRequest: {
        chatId: this._info.chatId,
        topic
      }
    }).then(() => {
      return;
    });
  }

  public markSeen(eventNumber: number): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      markChatEventsSeenRequest: {
        chatId: this._info.chatId,
        eventNumber
      }
    }).then(() => {
      return;
    });
  }

  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]> {
    this._assertJoined();
    return this._connection.request({
      getChatHistoryRequest: {
        chatId: this._info.chatId,
        startEvent: toOptional(options.startEvent),
        limit: toOptional(options.limit),
        forward: toOptional(options.forward),
        eventFilter: options.eventFilter
      }
    }).then((message: IConvergenceMessage) => {
      const response = message.getChatHistoryResponse;
      return getOrDefaultArray(response.eventData)
        .map(data => ChatHistoryEventMapper.toChatHistoryEntry(data, this._identityCache));
    });
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertJoined(): void {
    if (!this.isJoined()) {
      throw new Error(`Chat channel not joined: ${this._info.chatId}`);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _processEvent(event: IChatEvent): void {
    if (event instanceof ChatEvent) {
      this._info = {...this._info, lastEventNumber: event.eventNumber, lastEventTime: event.timestamp};
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      // TODO should we allow a seen number to come along?
      const user = (event instanceof UserJoinedEvent) ? event.user : event.addedUser;
      const members = this._info.members.slice(0);
      const member = {user: event.user, maxSeenEventNumber: -1};
      members.push(member);
      if (event.user.username === this.session().user().username) {
        // FIXME this might not be right for rooms
        this._joined = true;
      }
      this._info = {...this._info, members};
    } else if (event instanceof UserLeftEvent || event instanceof UserRemovedEvent) {
      const removedUser = (event instanceof UserLeftEvent) ? event.user : event.removedUser;
      if (this.session().user().userId.equals(removedUser.userId)) {
        // FIXME this might not be right for rooms
        this._joined = false;
      }
      const members = this._info.members.filter(member => !member.user.userId.equals(removedUser.userId));
      this._info = {...this._info, members};
    } else if (event instanceof ChatNameChanged) {
      this._info = {...this._info, name: event.chatName};
    } else if (event instanceof ChatTopicChanged) {
      this._info = {...this._info, topic: event.topic};
    }

    Object.freeze(this._info);
  }
}

export interface ChatHistorySearchOptions {
  startEvent?: number;
  limit?: number;
  forward?: boolean;
  eventFilter?: string[];
}

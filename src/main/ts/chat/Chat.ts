import {ConvergenceError, ConvergenceEventEmitter} from "../util/";
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
import {ConvergenceErrorCodes} from "../util/ConvergenceErrorCodes";
import {Immutable} from "../util/Immutable";

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

/**
 * The [[Chat]] class is the base class of all Chat types in Convergence. It
 * provides several methods and behaviors that are common to all Chat
 * subclasses, such as the ability to send messages, set a name and topic, etc.
 */
export abstract class Chat extends ConvergenceEventEmitter<IChatEvent> {
  public static readonly Events: ChatEvents = Events;

  /**
   * @internal
   */
  protected readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  protected _info: ChatInfo;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

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

  /**
   * @returns
   *   The [[ConvergenceSession]] this [[Chat]] is associated with.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * @returns
   *   Information which describes the Chat. Subclasses may provide a more
   *   specific subclass of ChatInfo.
   */
  public info(): ChatInfo {
    return {...this._info};
  }

  /**
   * Determines if the Chat is Joined. Chat's must be joined to perform many
   * functions, such as sending messages.
   *
   * @returns
   *   True if the chat is joined, false otherwise.
   */
  public isJoined(): boolean {
    return this._joined;
  }

  /**
   * Publishes a chat message to this Chat.
   *
   * @param message
   *   The message to send.
   * @returns
   *   A promise acknowledging that the message has been received by the
   *   server.
   */
  public send(message: string): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      publishChatMessageRequest: {
        chatId: this._info.chatId,
        message
      }
    }).then(() => undefined);
  }

  /**
   * Sets the short descriptive name for this chat.
   *
   * @param name
   *   The name to set.
   *
   * @returns
   *   A promise acknowledging that the name has been successfully set.
   */
  public setName(name: string): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      setChatNameRequest: {
        chatId: this._info.chatId,
        name
      }
    }).then(() => undefined);
  }

  /**
   * Sets the the current topic being discussed in the chat.
   *
   * @param topic
   *   The topic to set.
   *
   * @returns
   *   A promise acknowledging that the topic has been successfully set.
   */
  public setTopic(topic: string): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      setChatTopicRequest: {
        chatId: this._info.chatId,
        topic
      }
    }).then(() => undefined);
  }

  /**
   * Marks the specified event number as having been seen by the local user.
   * It is assumed that all events prior or equal to this event have been
   * seen by the user.
   *
   * @param eventNumber
   *   The event number to mark as set.
   *
   * @returns
   *   A promise acknowledging that seen events have been marked successfully.
   */
  public markSeen(eventNumber: number): Promise<void> {
    this._assertOnline();
    this._assertJoined();
    return this._connection.request({
      markChatEventsSeenRequest: {
        chatId: this._info.chatId,
        eventNumber
      }
    }).then(() => undefined);
  }

  /**
   * Get the history of events for this [[Chat]]. Events consist of messages,
   * users joining / leaving, and a variety of other events depending on the chat
   * type.
   *
   * @param options
   *   Options that define the events the user would like to fetch.
   *
   * @returns
   *   A promise that will be resolved with an array of Chat events that match
   *   the specified search options.
   */
  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]> {
    this._assertOnline();
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
      const message = `Chat channel not joined: ${this._info.chatId}`;
      throw new ConvergenceError(message, ConvergenceErrorCodes.CHAT_NOT_JOINED);
    }
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertOnline(): void {
    if (!this._connection.isOnline()) {
      const message = `Can not perform the request action while offline`;
      throw new ConvergenceError(message, ConvergenceErrorCodes.OFFLINE);
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
      const member = {user, maxSeenEventNumber: -1};
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

    Immutable.make(this._info);
  }
}

export interface ChatHistorySearchOptions {
  startEvent?: number;
  limit?: number;
  forward?: boolean;
  eventFilter?: string[];
}

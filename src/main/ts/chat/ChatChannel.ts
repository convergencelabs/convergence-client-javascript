import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {
  ChatMessageEvent,
  UserAddedEvent,
  UserRemovedEvent,
  UserJoinedChannelEvent,
  UserLeftChannelEvent
} from "./events";
import {ChatChannelType} from "./ChatService";
import {ChatEvent} from "./events";
import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {PublishChatMessage} from "../connection/protocol/chat/chatMessage";
import {MessageType} from "../connection/protocol/MessageType";
import {SetChatChannelNameMessage} from "../connection/protocol/chat/setName";
import {SetChatChannelTopicMessage} from "../connection/protocol/chat/setTopic";
import {MarkChatChannelEventsSeenMessage} from "../connection/protocol/chat/markSeen";
import {ChatHistoryEntry} from "./ChatHistoryEntry";
import {
  ChatChannelHistoryResponseMessage,
  ChatChannelHistoryRequestMessage
} from "../connection/protocol/chat/getHistory";
import {Subscription, Observable} from "rxjs";

export declare interface ChatChannelInfo {
  readonly channelType: ChatChannelType;
  readonly channelId: string;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly eventCount: number;
  readonly unseenCount: number;
  readonly members: string[];
}

export declare interface ChatChannelEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
}

const Events: ChatChannelEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedChannelEvent.NAME,
  USER_LEFT: UserLeftChannelEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
};
Object.freeze(Events);

export abstract class ChatChannel extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatChannelEvents = Events;

  protected _info: ChatChannelInfo;
  protected _connection: ConvergenceConnection;

  private _joined: boolean;
  private _subscription: Subscription;

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: ChatChannelInfo) {
    super();
    this._connection = connection;
    this._info = info;

    messageStream.subscribe(event => {
      this._processEvent(event);
      this._emitEvent(event);
    });
  }

  public session(): Session {
    return this._connection.session();
  }

  public dispose(): void {
    this._subscription.unsubscribe();
  }

  public info(): ChatChannelInfo {
    return Object.assign({}, this._info);
  }

  public isJoined(): boolean {
    return this._joined;
  }

  public send(message: string): Promise<void> {
    this._assertJoined();
    return this._connection.request(<PublishChatMessage> {
      type: MessageType.PUBLISH_CHAT_MESSAGE_REQUEST,
      channelId: this._info.channelId,
      message
    }).then(() => {
      return;
    });
  }

  public setName(name: string): Promise<void> {
    this._assertJoined();
    return this._connection.request(<SetChatChannelNameMessage> {
      type: MessageType.SET_CHAT_CHANNEL_NAME_REQUEST,
      channelId: this._info.channelId,
      name
    }).then(() => {
      return;
    });
  }

  public setTopic(topic: string): Promise<void> {
    this._assertJoined();
    return this._connection.request(<SetChatChannelTopicMessage> {
      type: MessageType.SET_CHAT_CHANNEL_TOPIC_REQUEST,
      channelId: this._info.channelId,
      topic
    }).then(() => {
      return;
    });
  }

  public markSeen(eventNumber: number): Promise<void> {
    this._assertJoined();
    return this._connection.request(<MarkChatChannelEventsSeenMessage> {
      type: MessageType.MARK_CHAT_CHANNEL_EVENTS_SEEN_REQUEST,
      channelId: this._info.channelId,
      eventNumber
    }).then(() => {
      return;
    });
  }

  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]> {
    this._assertJoined();
    return this._connection.request(<ChatChannelHistoryRequestMessage> {
      type: MessageType.GET_CHAT_CHANNEL_HISTORY_REQUEST,
      channelId: this._info.channelId,
      backward: options.backward,
      limit: options.limit,
      offset: options.offset,
      eventTypes: options.eventTypes
    }).then((message: ChatChannelHistoryResponseMessage) => {
      return message.entries;
    });
  }

  protected _assertJoined(): void {
    if (!this.isJoined()) {
      throw new Error(`Chat channel not joined: ${this._info.channelId}`);
    }
  }

  private _processEvent(event: ChatEvent): void {
    // TODO
  }
}

export interface ChatHistorySearchOptions {
  backward: boolean;
  limit?: number;
  offset?: number;
  eventTypes?: string[];
}

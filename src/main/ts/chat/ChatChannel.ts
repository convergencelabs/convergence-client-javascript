import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {
  ChatMessageEvent,
  UserAddedEvent,
  UserRemovedEvent,
  UserJoinedEvent, ChatChannelEvent, UserLeftEvent, ChatChannelNameChanged,
  ChatChannelTopicChanged
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

export interface ChatChannelInfo {
  readonly channelType: ChatChannelType;
  readonly channelId: string;
  readonly channelMembership: string;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEvent: number;
  readonly members: string[];
}

export interface ChatChannelEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
}

const Events: ChatChannelEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedEvent.NAME,
  USER_LEFT: UserLeftEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
};
Object.freeze(Events);

export abstract class ChatChannel extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatChannelEvents = Events;

  protected _info: ChatChannelInfo;
  protected _connection: ConvergenceConnection;

  private _joined: boolean;

  constructor(connection: ConvergenceConnection,
              messageStream: Observable<ChatEvent>,
              info: ChatChannelInfo) {
    super();
    this._connection = connection;
    this._info = info;

    // TODO this might not make sense for rooms
    this._joined = info.members.includes(this.session().username());

    messageStream.subscribe(event => {
      this._processEvent(event);
      this._emitEvent(event);
    });
  }

  public session(): Session {
    return this._connection.session();
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
      startEvent: options.startEvent,
      limit: options.limit,
      forward: options.forward,
      eventFilter: options.eventFilter
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
    if (event instanceof ChatChannelEvent) {
      const lastEventTime = event.timestamp;
      const eventCount = event.eventNumber;
      this._info = Object.assign({}, this._info, {eventCount, lastEventTime});
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      const members = this._info.members.slice(0);
      members.push(event.username);
      if (event.username === this.session().username()) {
        // FIXME this might not be right for rooms
        this._joined = true;
      }
      this._info = Object.assign({}, this._info, {members});
    } else if (event instanceof UserLeftEvent || event instanceof UserRemovedEvent) {
      const removedUsername = event.username;
      if (removedUsername === this.session().username()) {
        // FIXME this might not be right for rooms
        this._joined = false;
      }
      const members = this._info.members.filter(username => username !== removedUsername);
      this._info = Object.assign({}, this._info, {members});
    } else if (event instanceof ChatChannelNameChanged) {
      const name = event.channelName;
      this._info = Object.assign({}, this._info, {name});
    } else if (event instanceof ChatChannelTopicChanged) {
      const topic = event.topic;
      this._info = Object.assign({}, this._info, {topic});
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

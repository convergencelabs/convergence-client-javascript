import {ConvergenceEventEmitter} from "../util/";
import {
  ChatChannelNameChanged,
  ChatEvent,
  ChatChannelTopicChanged,
  ChatMessageEvent,
  ChatChannelEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent
} from "./events/";
import {ChatChannelType} from "./ChatService";
import {ConvergenceSession} from "../ConvergenceSession";
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
import {Observable} from "rxjs";

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

  /**
   * @internal
   */
  protected _info: ChatChannelInfo;

  /**
   * @internal
   */
  protected _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private _joined: boolean;

  /**
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
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

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  public info(): ChatChannelInfo {
    return {...this._info};
  }

  public isJoined(): boolean {
    return this._joined;
  }

  public send(message: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.PUBLISH_CHAT_MESSAGE_REQUEST,
      channelId: this._info.channelId,
      message
    } as PublishChatMessage).then(() => {
      return;
    });
  }

  public setName(name: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.SET_CHAT_CHANNEL_NAME_REQUEST,
      channelId: this._info.channelId,
      name
    } as SetChatChannelNameMessage).then(() => {
      return;
    });
  }

  public setTopic(topic: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.SET_CHAT_CHANNEL_TOPIC_REQUEST,
      channelId: this._info.channelId,
      topic
    } as SetChatChannelTopicMessage).then(() => {
      return;
    });
  }

  public markSeen(eventNumber: number): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      type: MessageType.MARK_CHAT_CHANNEL_EVENTS_SEEN_REQUEST,
      channelId: this._info.channelId,
      eventNumber
    } as MarkChatChannelEventsSeenMessage).then(() => {
      return;
    });
  }

  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]> {
    this._assertJoined();

    return this._connection.request({
      type: MessageType.GET_CHAT_CHANNEL_HISTORY_REQUEST,
      channelId: this._info.channelId,
      startEvent: options.startEvent,
      limit: options.limit,
      forward: options.forward,
      eventFilter: options.eventFilter
    } as ChatChannelHistoryRequestMessage).then((message: ChatChannelHistoryResponseMessage) => {
      return message.entries;
    });
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertJoined(): void {
    if (!this.isJoined()) {
      throw new Error(`Chat channel not joined: ${this._info.channelId}`);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _processEvent(event: ChatEvent): void {
    if (event instanceof ChatChannelEvent) {
      const lastEventTime = event.timestamp;
      const lastEventNumber = event.eventNumber;
      this._info = {...this._info, lastEventNumber, lastEventTime};
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      const members = this._info.members.slice(0);
      members.push(event.username);
      if (event.username === this.session().username()) {
        // FIXME this might not be right for rooms
        this._joined = true;
      }
      this._info = {...this._info, members};
    } else if (event instanceof UserLeftEvent || event instanceof UserRemovedEvent) {
      const removedUsername = event.username;
      if (removedUsername === this.session().username()) {
        // FIXME this might not be right for rooms
        this._joined = false;
      }
      const members = this._info.members.filter(username => username !== removedUsername);
      this._info = {...this._info, members};
    } else if (event instanceof ChatChannelNameChanged) {
      const name = event.channelName;
      this._info = {...this._info, name};
    } else if (event instanceof ChatChannelTopicChanged) {
      const topic = event.topic;
      this._info = {...this._info, topic};
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

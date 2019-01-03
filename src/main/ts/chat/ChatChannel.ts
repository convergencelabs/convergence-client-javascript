import {ConvergenceEventEmitter} from "../util/";
import {
  ChatChannelNameChanged,
  IChatEvent,
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
import {ChatHistoryEntry} from "./ChatHistoryEntry";
import {Observable} from "rxjs";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {ChatHistoryEventMapper} from "./ChatHistoryEventMapper";
import {toOptional} from "../connection/ProtocolUtil";

export interface ChatChannelInfo {
  readonly channelType: ChatChannelType;
  readonly channelId: string;
  readonly channelMembership: string;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEventNumber: number;
  readonly members: ChatChannelMember[];
}

export interface ChatChannelMember {
  readonly username: string;
  readonly maxSeenEventNumber: number;
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

export abstract class ChatChannel extends ConvergenceEventEmitter<IChatEvent> {
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
                        messageStream: Observable<IChatEvent>,
                        info: ChatChannelInfo) {
    super();
    this._connection = connection;
    this._info = info;

    // TODO this might not make sense for rooms
    this._joined = info.members
      .map(m => m.username)
      .includes(this.session().username());

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
      publishChatMessageRequest: {
        channelId: this._info.channelId,
        message
      }
    }).then(() => {
      return;
    });
  }

  public setName(name: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      setChatChannelNameRequest: {
        channelId: this._info.channelId,
        name
      }
    }).then(() => {
      return;
    });
  }

  public setTopic(topic: string): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      setChatChannelTopicRequest: {
        channelId: this._info.channelId,
        topic
      }
    }).then(() => {
      return;
    });
  }

  public markSeen(eventNumber: number): Promise<void> {
    this._assertJoined();
    return this._connection.request({
      markChatChannelEventsSeenRequest: {
        channelId: this._info.channelId,
        eventNumber
      }
    }).then(() => {
      return;
    });
  }

  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]> {
    this._assertJoined();
    return this._connection.request({
      getChatChannelHistoryRequest: {
        channelId: this._info.channelId,
        startEvent: toOptional(options.startEvent),
        limit: toOptional(options.limit),
        forward: toOptional(options.forward),
        eventFilter: options.eventFilter
      }
    }).then((message: IConvergenceMessage) => {
      const response = message.getChatChannelHistoryResponse;
      return response.eventData!.map(data => ChatHistoryEventMapper.toChatHistoryEntry(data));
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
  private _processEvent(event: IChatEvent): void {
    if (event instanceof ChatChannelEvent) {
      const lastEventTime = event.timestamp;
      const lastEventNumber = event.eventNumber;
      this._info = {...this._info, lastEventNumber, lastEventTime};
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      const members = this._info.members.slice(0);
      // TODO should we allow a seen number to come along?
      members.push({username: event.username, maxSeenEventNumber: -1});
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
      const members = this._info.members.filter(member => member.username !== removedUsername);
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

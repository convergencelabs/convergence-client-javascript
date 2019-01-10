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
import {getOrDefaultArray, toOptional} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";

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
      .includes(this.session().user().username);

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
      return getOrDefaultArray(response.eventData).map(data => ChatHistoryEventMapper.toChatHistoryEntry(data));
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
      this._info = {...this._info, lastEventNumber: event.eventNumber, lastEventTime: event.timestamp};
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      const members = this._info.members.slice(0);
      // TODO should we allow a seen number to come along?
      members.push({username: event.user.username, maxSeenEventNumber: -1});
      if (event.user.username === this.session().user().username) {
        // FIXME this might not be right for rooms
        this._joined = true;
      }
      this._info = {...this._info, members};
    } else if (event instanceof UserLeftEvent || event instanceof UserRemovedEvent) {
      const removedUsername = event.user.username;
      if (removedUsername === this.session().user().username) {
        // FIXME this might not be right for rooms
        this._joined = false;
      }
      const members = this._info.members.filter(member => member.username !== removedUsername);
      this._info = {...this._info, members};
    } else if (event instanceof ChatChannelNameChanged) {
      this._info = {...this._info, name: event.channelName};
    } else if (event instanceof ChatChannelTopicChanged) {
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

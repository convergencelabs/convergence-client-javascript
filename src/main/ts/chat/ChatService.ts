import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {ConvergenceEventEmitter, Validation, ConvergenceServerError} from "../util/";
import {
  ChatEvent,
  ChannelLeftEvent,
  ChatMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent,
  ChannelJoinedEvent
} from "./events/";
import {processChatMessage} from "./ChatMessageProcessor";
import {ChatChannel, ChatChannelInfo} from "./ChatChannel";
import {DirectChatChannel} from "./DirectChatChannel";
import {JoinChatChannelRequestMessage, JoinChatChannelResponseMessage} from "../connection/protocol/chat/joining";
import {LeaveChatChannelRequestMessage} from "../connection/protocol/chat/leaving";
import {CreateChatChannelRequestMessage, CreateChatChannelResponseMessage} from "../connection/protocol/chat/create";
import {
  GetChatChannelsResponseMessage, GetChatChannelsRequestMessage,
  GetJoinedChannelsRequestMessage, GetDirectChannelsRequestMessage, SearchChatChannelsRequestMessage,
  ChatChannelExistsResponseMessage
} from "../connection/protocol/chat/getChannel";
import {MembershipChatChannelInfo} from "./MembershipChatChannel";
import {Observable} from "rxjs";
import {ChatChannelInfoData} from "../connection/protocol/chat/info";
import {GroupChatChannel} from "./GroupChatChannel";
import {ChatRoomChannel} from "./ChatRoomChannel";
import {RemoveChatChannelRequestMessage} from "../connection/protocol/chat/remove";
import {ChatPermissionManager} from "./ChatPermissionManager";

export declare interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
  readonly CHANNEL_JOINED: string;
  readonly CHANNEL_LEFT: string;
}

const Events: ChatServiceEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedEvent.NAME,
  USER_LEFT: UserLeftEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
  CHANNEL_JOINED: ChannelJoinedEvent.NAME,
  CHANNEL_LEFT: ChannelLeftEvent.NAME
};
Object.freeze(Events);

export type ChatChannelType = "direct" | "group" | "room";

export const ChatChannelTypes = {
  DIRECT: "direct",
  GROUP: "group",
  ROOM: "room"
};

export class ChatService extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatServiceEvents = Events;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _messageStream: Observable<ChatEvent>;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;

    const messageTypes = [
      MessageType.USER_JOINED_CHAT_CHANNEL,
      MessageType.USER_LEFT_CHAT_CHANNEL,
      MessageType.USER_ADDED_TO_CHAT_CHANNEL,
      MessageType.USER_REMOVED_FROM_CHAT_CHANNEL,
      MessageType.CHAT_CHANNEL_REMOVED,
      MessageType.CHAT_CHANNEL_NAME_CHANGED,
      MessageType.CHAT_CHANNEL_TOPIC_CHANGED,
      MessageType.REMOTE_CHAT_MESSAGE
    ];

    this._messageStream = this._connection
      .messages(messageTypes)
      .pluck("message")
      .map(message => processChatMessage(message))
      .do(event => {
        if (event instanceof UserJoinedEvent && event.username === this.session().username()) {
          const joined = new ChannelJoinedEvent(event.channelId);
          this._emitEvent(joined);
        } else if (event instanceof UserLeftEvent && event.username === this.session().username()) {
          const left = new ChannelLeftEvent(event.channelId);
          this._emitEvent(left);
        }
      })
      .share();

    this._emitFrom(this._messageStream);
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  public search(criteria: ChatSearchCriteria): Promise<ChatChannelInfo[]> {
    return this._connection.request({
      type: MessageType.SEARCH_CHAT_CHANNELS_REQUEST
    } as SearchChatChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
      return message.channels.map(channel => this._createChannelInfo(channel));
    });
  }

  public exists(channelId: string): Promise<boolean> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      type: MessageType.CHAT_CHANNEL_EXISTS_REQUEST,
      channelIds: [channelId]
    } as GetChatChannelsRequestMessage).then((message: ChatChannelExistsResponseMessage) => {
      const exists = message.exists[0];
      return exists;
    });
  }

  public get(channelId: string): Promise<ChatChannel> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      type: MessageType.GET_CHAT_CHANNELS_REQUEST,
      channelIds: [channelId]
    } as GetChatChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
      const channelData = message.channels[0];
      const channelInfo = this._createChannelInfo(channelData);
      return this._createChannel(channelInfo);
    });
  }

  // Methods that apply to Group Chat Channels.
  public joined(): Promise<ChatChannelInfo[]> {
    return this._connection.request({
      type: MessageType.CREATE_CHAT_CHANNEL_REQUEST
    } as GetJoinedChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
      return message.channels.map(channel => this._createChannelInfo(channel));
    });
  }

  public create(options: CreateChatChannelOptions): Promise<string> {
    if (!options) {
      throw new Error("create options must be supplied");
    }

    if (options.type !== "group" && options.type !== "room") {
      throw new Error(`type must be 'group' or 'room': ${options.type}`);
    }

    if (options.membership !== "public" && options.membership !== "private") {
      throw new Error(`membership must be 'public' or 'private': ${options.membership}`);
    }

    if (options.type === "room" && options.membership === "private") {
      throw new Error(`membership must be 'public' for a 'room': ${options.membership}`);
    }

    if (options.id !== undefined) {
      Validation.assertNonEmptyString(options.id, "id");
    }

    const {id, type: channelType, name, topic, membership, members} = options;
    return this._connection.request({
      type: MessageType.CREATE_CHAT_CHANNEL_REQUEST,
      id, channelType, name, topic, membership, members
    } as CreateChatChannelRequestMessage).then((message: CreateChatChannelResponseMessage) => {
      return message.channelId;
    }).catch(error => {
      if (error instanceof ConvergenceServerError &&
        error.code === "channel_already_exists" &&
        options.ignoreExistsError) {
        // The channel already exists, this can only happen if the user specified the id.
        // they have indicated that they want to ignore the situation where the channel already
        // exists, so we just resolve with the id they passed in.
        return Promise.resolve(id);
      } else {
        // This is an unexpected error, pass it along.
        return Promise.reject(error);
      }
    });
  }

  public remove(channelId: string): Promise<void> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      type: MessageType.REMOVE_CHAT_CHANNEL_REQUEST,
      channelId
    } as RemoveChatChannelRequestMessage).then(() => {
      return;
    });
  }

  public join(channelId: string): Promise<ChatChannel> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      type: MessageType.JOIN_CHAT_CHANNEL_REQUEST,
      channelId
    } as JoinChatChannelRequestMessage).then((message: JoinChatChannelResponseMessage) => {
      const channelInfo = this._createChannelInfo(message.channel);
      return this._createChannel(channelInfo);
    });
  }

  public leave(channelId: string): Promise<void> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      type: MessageType.LEAVE_CHAT_CHANNEL_REQUEST,
      channelId
    } as LeaveChatChannelRequestMessage).then(() => {
      return;
    });
  }

  // Methods that apply to Single User Chat Channels.
  public direct(username: string): Promise<DirectChatChannel>;
  public direct(usernames: string[]): Promise<DirectChatChannel>;
  public direct(usernames: string | string[]): Promise<DirectChatChannel> {
    if (typeof usernames === "string") {
      usernames = [usernames];
    }

    return this._connection.request({
      type: MessageType.GET_DIRECT_CHAT_CHANNELS_REQUEST,
      channelUsernames: [usernames]
    } as GetDirectChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
      const channelData = message.channels[0];
      const info = this._createChannelInfo(channelData);
      const channel = this._createChannel(info);
      return channel as DirectChatChannel;
    });
  }

  public permissions(channelId: string): ChatPermissionManager {
    return new ChatPermissionManager(channelId, this._connection);
  }

  /**
   * @hidden
   * @internal
   */
  private _createChannelInfo(channelData: ChatChannelInfoData): ChatChannelInfo {
    if (channelData.channelType === "direct") {
      return {
        channelId: channelData.channelId,
        channelType: channelData.channelType,
        channelMembership: channelData.channelMembership,
        name: channelData.name,
        topic: channelData.topic,
        createdTime: channelData.createdTime,
        lastEventTime: channelData.lastEventTime,
        lastEventNumber: channelData.lastEventNumber,
        maxSeenEvent: channelData.maxSeenEvent,
        members: channelData.members
      };
    } else {
      return {
        channelId: channelData.channelId,
        channelType: channelData.channelType,
        channelMembership: channelData.channelMembership,
        name: channelData.name,
        topic: channelData.topic,
        createdTime: channelData.createdTime,
        lastEventTime: channelData.lastEventTime,
        lastEventNumber: channelData.maxSeenEvent,
        maxSeenEvent: channelData.maxSeenEvent,
        members: channelData.members
      } as MembershipChatChannelInfo;
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _createChannel(channelInfo: ChatChannelInfo): ChatChannel {
    const messageStream = this._messageStream.filter(msg => msg.channelId === channelInfo.channelId);
    switch (channelInfo.channelType) {
      case ChatChannelTypes.DIRECT:
        return new DirectChatChannel(this._connection, messageStream, channelInfo);
      case ChatChannelTypes.GROUP:
        const groupInfo: MembershipChatChannelInfo = channelInfo as MembershipChatChannelInfo;
        return new GroupChatChannel(this._connection, messageStream, groupInfo);
      case ChatChannelTypes.ROOM:
        const roomInfo: MembershipChatChannelInfo = channelInfo as MembershipChatChannelInfo;
        return new ChatRoomChannel(this._connection, messageStream, roomInfo);
      default:
        throw new Error(`Invalid chat channel type: ${channelInfo.channelType}`);
    }
  }
}

export interface ChatSearchCriteria {
  type?: string;
  name?: string;
  topic?: string;
}

export interface CreateChatChannelOptions {
  type: string;
  membership: string;
  id?: string;
  name?: string;
  topic?: string;
  members?: string[];
  ignoreExistsError?: boolean;
}

import {Session} from "../Session";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {MessageType} from "../connection/protocol/MessageType";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatEvent} from "./events";
import {
  ChatMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent,
  ChannelJoinedEvent,
  ChannelLeftEvent
} from "./events";
import {processChatMessage} from "./ChatMessageProcessor";
import {ChatChannel, ChatChannelInfo} from "./ChatChannel";
import {SingleUserChatChannel} from "./SingleUserChatChannel";
import {JoinChatChannelRequestMessage} from "../connection/protocol/chat/joining";
import {LeaveChatChannelRequestMessage} from "../connection/protocol/chat/leaving";
import {CreateChatChannelRequestMessage, CreateChatChannelResponseMessage} from "../connection/protocol/chat/create";
import {
  GetChatChannelsResponseMessage, GetChatChannelsRequestMessage,
  GetJoinedChannelsRequestMessage, GetDirectChannelsRequestMessage, SearchChatChannelsRequestMessage
} from "../connection/protocol/chat/getChannel";
import {MultiUserChatChannel, MultiUserChatInfo} from "./MultiUserChatChannel";
import {Observable} from "rxjs";
import {ChatChannelInfoData} from "../connection/protocol/chat/info";

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

export declare type ChatChannelType = "user" | "group" | "room";

export class ChatService extends ConvergenceEventEmitter<ChatEvent> {

  public static readonly Events: ChatServiceEvents = Events;

  private _connection: ConvergenceConnection;
  private _messageStream: Observable<ChatEvent>;

  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;

    const messageTypes = [
      MessageType.USER_JOINED_CHAT_CHANNEL,
      MessageType.USER_LEFT_CHAT_CHANNEL,
      MessageType.USER_ADDED_TO_CHAT_CHANNEL,
      MessageType.USER_REMOVED_FROM_CHAT_CHANNEL,
      MessageType.CHAT_CHANNEL_JOINED,
      MessageType.CHAT_CHANNEL_LEFT,
      MessageType.CHAT_CHANNEL_REMOVED,
      MessageType.CHAT_CHANNEL_NAME_CHANGED,
      MessageType.CHAT_CHANNEL_TOPIC_CHANGED,
      MessageType.REMOTE_CHAT_MESSAGE
    ];

    this._messageStream = this._connection
      .messages(messageTypes)
      .pluck("message")
      .map(message => processChatMessage(message))
      .share();

    this._emitFrom(this._messageStream);
  }

  public session(): Session {
    return this._connection.session();
  }

  public search(criteria: ChatSearchCriteria): Promise<ChatChannelInfo[]> {
    return this._connection.request(<SearchChatChannelsRequestMessage> {
      type: MessageType.SEARCH_CHAT_CHANNELS_REQUEST
    }).then((message: GetChatChannelsResponseMessage) => {
      return message.channels.map(channel => this._createChannelInfo(channel));
    });
  }

  public get(channelId: string): Promise<ChatChannel> {
    return this._connection.request(<GetChatChannelsRequestMessage> {
      type: MessageType.GET_CHAT_CHANNELS_REQUEST,
      channelIds: [channelId]
    }).then((message: GetChatChannelsResponseMessage) => {
      const channelData = message.channels[0];
      const channelInfo = this._createChannelInfo(channelData);
      return this._createChannel(channelInfo);
    });
  }

  // Methods that apply to Group Chat Channels.
  public joined(): Promise<ChatChannelInfo[]> {
    return this._connection.request(<GetJoinedChannelsRequestMessage> {
      type: MessageType.CREATE_CHAT_CHANNEL_REQUEST
    }).then((message: GetChatChannelsResponseMessage) => {
      return message.channels.map(channel => this._createChannelInfo(channel));
    });
  }

  public create(options: CreateChatChannelOptions): Promise<string> {
    const {channelId, channelType, name, topic, privateChannel, members} = options;
    return this._connection.request(<CreateChatChannelRequestMessage> {
      type: MessageType.CREATE_CHAT_CHANNEL_REQUEST,
      channelId, channelType, name, topic, privateChannel, members
    }).then((message: CreateChatChannelResponseMessage) => {
      return message.channelId;
    });
  }

  public remove(channelId: string): Promise<void> {
    return this._connection.request(<JoinChatChannelRequestMessage> {
      type: MessageType.REMOVE_CHAT_CHANNEL_REQUEST,
      channelId
    }).then(() => {
      return;
    });
  }

  public join(channelId: string): Promise<void> {
    return this._connection.request(<JoinChatChannelRequestMessage> {
      type: MessageType.JOIN_CHAT_CHANNEL_REQUEST,
      channelId
    }).then(() => {
      return;
    });
  }

  public leave(channelId: string): Promise<void> {
    return this._connection.request(<LeaveChatChannelRequestMessage> {
      type: MessageType.LEAVE_CHAT_CHANNEL_REQUEST,
      channelId
    }).then(() => {
      return;
    });
  }

  // Methods that apply to Single User Chat Channels.
  public direct(username: string): Promise<SingleUserChatChannel> {
    return this._connection.request(<GetDirectChannelsRequestMessage> {
      type: MessageType.GET_DIRECT_CHAT_CHANNELS_REQUEST,
      usernames: [username]
    }).then((message: GetChatChannelsResponseMessage) => {
      const channelData = message.channels[0];
      const info = this._createChannelInfo(channelData);
      const channel = this._createChannel(info);
      return channel;
    });
  }

  private _createChannelInfo(channelData: ChatChannelInfoData): ChatChannelInfo {
    if (channelData.channelType === "user") {
      return {
        channelId: channelData.channelId,
        channelType: channelData.channelType,
        name: channelData.name,
        topic: channelData.topic,
        createdTime: channelData.createdTime,
        lastEventTime: channelData.lastEventTime,
        eventCount: channelData.eventCount,
        unseenCount: channelData.unseenCount,
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
        eventCount: channelData.eventCount,
        unseenCount: channelData.unseenCount,
        members: channelData.members
      } as MultiUserChatInfo;
    }
  }

  private _createChannel(channelInfo: ChatChannelInfo): ChatChannel {
    const messageStream = this._messageStream.filter(msg => msg.channelId === channelInfo.channelId);
    let channel: ChatChannel;
    if (channelInfo.channelType === "user") {
      return new SingleUserChatChannel(this._connection, messageStream, channelInfo);
    } else {
      const info: MultiUserChatInfo = channelInfo as MultiUserChatInfo;
      return new MultiUserChatChannel(this._connection, messageStream, info);
    }
  }
}

export declare interface ChatSearchCriteria {
  type?: string;
  name?: string;
  topic?: string;
}

export declare interface CreateChatChannelOptions {
  channelId?: string;
  channelType: string;
  name?: string;
  topic?: string;
  privateChannel?: boolean;
  members?: string[];
}

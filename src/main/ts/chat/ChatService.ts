import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter, Validation, ConvergenceServerError} from "../util/";
import {
  IChatEvent,
  ChannelLeftEvent,
  ChatMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent,
  ChannelJoinedEvent
} from "./events/";
import {processChatMessage} from "./ChatMessageProcessor";
import {ChatChannel, ChatChannelInfo, ChatChannelMember} from "./ChatChannel";
import {DirectChatChannel} from "./DirectChatChannel";
import {MembershipChatChannelInfo} from "./MembershipChatChannel";
import {Observable} from "rxjs";
import {filter, share, tap, map} from "rxjs/operators";
import {GroupChatChannel} from "./GroupChatChannel";
import {ChatRoomChannel} from "./ChatRoomChannel";
import {ChatPermissionManager} from "./ChatPermissionManager";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IChatChannelInfoData = io.convergence.proto.IChatChannelInfoData;
import {timestampToDate, toOptional} from "../connection/ProtocolUtil";

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

export class ChatService extends ConvergenceEventEmitter<IChatEvent> {

  public static readonly Events: ChatServiceEvents = Events;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _messageStream: Observable<IChatEvent>;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection) {
    super();
    this._connection = connection;

    this._messageStream = this._connection
      .messages()
      .pipe(
        map(message => processChatMessage(message.message)),
        tap(event => {
          if (event instanceof UserJoinedEvent && event.username === this.session().username()) {
            const joined = new ChannelJoinedEvent(event.channelId);
            this._emitEvent(joined);
          } else if (event instanceof UserLeftEvent && event.username === this.session().username()) {
            const left = new ChannelLeftEvent(event.channelId);
            this._emitEvent(left);
          }
        }),
        share());

    this._emitFrom(this._messageStream);
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  // FIXME implement
  // public search(criteria: ChatSearchCriteria): Promise<ChatChannelInfo[]> {
  //   return this._connection.request({
  //     type: MessageType.SEARCH_CHAT_CHANNELS_REQUEST
  //   } as SearchChatChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
  //     return message.channels.map(channel => this._createChannelInfo(channel));
  //   });
  // }

  public exists(channelId: string): Promise<boolean> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      chatChannelExistsRequest: {
        channelIds: [channelId]
      }
    }).then((response: IConvergenceMessage) => {
      const {chatChannelExistsResponse} = response;
      return chatChannelExistsResponse.exists[0];
    });
  }

  public get(channelId: string): Promise<ChatChannel> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      getChatChannelsRequest: {
        channelIds: [channelId]
      }
    }).then((response: IConvergenceMessage) => {
      const {getChatChannelsResponse} = response;
      const channelData = getChatChannelsResponse.chatChannelInfo[0];
      const channelInfo = this._createChannelInfo(channelData);
      return this._createChannel(channelInfo);
    });
  }

  // Methods that apply to Group Chat Channels.
  public joined(): Promise<ChatChannelInfo[]> {
    return this._connection.request({
      getJoinedChatChannelsRequest: {}
    }).then((response: IConvergenceMessage) => {
      const {getJoinedChatChannelsResponse} = response;
      return getJoinedChatChannelsResponse.chatChannelInfo.map(channel => this._createChannelInfo(channel));
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
      createChatChannelRequest: {
        channelId: toOptional(id),
        channelType,
        channelMembership: membership,
        name,
        topic,
        members
      }
    }).then((response: IConvergenceMessage) => {
      const {createChatChannelResponse} = response;
      return createChatChannelResponse.channelId;
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
      removeChatChannelRequest: {
        channelId
      }
    }).then(() => {
      return;
    });
  }

  public join(channelId: string): Promise<ChatChannel> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      joinChatChannelRequest: {
        channelId
      }
    }).then((response: IConvergenceMessage) => {
      const {joinChatChannelResponse} = response;
      const channelInfo = this._createChannelInfo(joinChatChannelResponse.channelInfo);
      return this._createChannel(channelInfo);
    });
  }

  public leave(channelId: string): Promise<void> {
    Validation.assertNonEmptyString(channelId, "channelId");
    return this._connection.request({
      leaveChatChannelRequest: {
        channelId
      }
    }).then(() => {
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
      getDirectChatChannelsRequest: {
        usernameLists: [{values: usernames}]
      }
    }).then((response: IConvergenceMessage) => {
      const {getDirectChatChannelsResponse} = response;
      const channelData = getDirectChatChannelsResponse.chatChannelInfo[0];
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
  private _createChannel(channelInfo: ChatChannelInfo): ChatChannel {
    const messageStream = this._messageStream.pipe(filter(msg => msg.channelId === channelInfo.channelId));
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

  /**
   * @hidden
   * @internal
   */
  private _createChannelInfo(channelData: IChatChannelInfoData): ChatChannelInfo {
    let maxEvent = -1;
    const members: ChatChannelMember[] = [];
    channelData.members.forEach(member => {
      members.push({username: member.username, maxSeenEventNumber: member.maxSeenEventNumber as number});
      if (member.username === this._connection.session().username()) {
        maxEvent = member.maxSeenEventNumber as number;
      }
    });
    return {
      channelId: channelData.id,
      channelType: channelData.channelType as ChatChannelType,
      channelMembership: channelData.membership,
      name: channelData.name,
      topic: channelData.topic,
      createdTime: timestampToDate(channelData.createdTime),
      lastEventTime: timestampToDate(channelData.lastEventTime),
      lastEventNumber: channelData.lastEventNumber as number,
      maxSeenEventNumber: maxEvent,
      members
    };
  }
}

//
// export interface ChatSearchCriteria {
//   type?: string;
//   name?: string;
//   topic?: string;
// }

export interface CreateChatChannelOptions {
  type: string;
  membership: string;
  id?: string;
  name?: string;
  topic?: string;
  members?: string[];
  ignoreExistsError?: boolean;
}

import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ConvergenceEventEmitter, Validation, ConvergenceServerError} from "../util/";
import {
  IChatEvent,
  ChatLeftEvent,
  ChatMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent,
  ChatJoinedEvent
} from "./events/";
import {isChatMessage, processChatMessage} from "./ChatMessageProcessor";
import {Chat, ChatInfo} from "./Chat";
import {DirectChat} from "./DirectChat";
import {ChatMembership, MembershipChatInfo} from "./MembershipChat";
import {Observable} from "rxjs";
import {filter, share, tap, map} from "rxjs/operators";
import {ChatChannel} from "./ChatChannel";
import {ChatRoom} from "./ChatRoom";
import {ChatPermissionManager} from "./ChatPermissionManager";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IChatInfoData = io.convergence.proto.IChatInfoData;
import {
  domainUserIdToProto,
  getOrDefaultNumber,
  protoToDomainUserId,
  timestampToDate,
  toOptional
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserId} from "../identity/DomainUserId";
import {DomainUserIdentifier} from "../identity";

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
  CHANNEL_JOINED: ChatJoinedEvent.NAME,
  CHANNEL_LEFT: ChatLeftEvent.NAME
};
Object.freeze(Events);

export type ChatType = "direct" | "channel" | "room";

export const ChatTypes = {
  DIRECT: "direct",
  CHANNEL: "group",
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
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection, identityCache: IdentityCache) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;

    this._messageStream = this._connection
      .messages()
      .pipe(
        filter(message => isChatMessage(message.message)),
        map(message => processChatMessage(message.message, this._identityCache)),
        tap(event => {
          if (event instanceof UserJoinedEvent && event.user.username === this.session().user().username) {
            const joined = new ChatJoinedEvent(event.chatId);
            this._emitEvent(joined);
          } else if (event instanceof UserLeftEvent && event.user.username === this.session().user().username) {
            const left = new ChatLeftEvent(event.chatId);
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
  // public search(criteria: ChatSearchCriteria): Promise<ChatInfo[]> {
  //   return this._connection.request({
  //     type: MessageType.SEARCH_CHAT_CHANNELS_REQUEST
  //   } as SearchChatChannelsRequestMessage).then((message: GetChatChannelsResponseMessage) => {
  //     return message.channels.map(channel => this._createChatInfo(channel));
  //   });
  // }

  public exists(chatId: string): Promise<boolean> {
    Validation.assertNonEmptyString(chatId, "chatId");
    return this._connection.request({
      chatsExistRequest: {
        chatIds: [chatId]
      }
    }).then((response: IConvergenceMessage) => {
      const {chatsExistResponse} = response;
      return chatsExistResponse.exists[0];
    });
  }

  public get(chatId: string): Promise<Chat> {
    Validation.assertNonEmptyString(chatId, "chatId");
    return this._connection
      .request({
        getChatsRequest: {
          chatIds: [chatId]
        }
      })
      .then((response: IConvergenceMessage) => {
        const {getChatsResponse} = response;
        const chatData = getChatsResponse.chatInfo[0];
        const chatInfo = this._createChatInfo(chatData);
        return this._createChat(chatInfo);
      });
  }

  // Methods that apply to Group Chat Channels.
  public joined(): Promise<ChatInfo[]> {
    return this._connection
      .request({
        getJoinedChatsRequest: {}
      })
      .then((response: IConvergenceMessage) => {
        const {getJoinedChatsResponse} = response;
        return getJoinedChatsResponse.chatInfo.map(chatInfo => this._createChatInfo(chatInfo));
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

    const {id, type: chatType, name, topic, membership, members} = options;
    const memberIds = (members || []).map(member => {
      if (member instanceof DomainUserId) {
        return domainUserIdToProto(member);
      } else {
        return domainUserIdToProto(DomainUserId.normal(member));
      }
    });

    return this._connection
      .request({
        createChatRequest: {
          chatId: toOptional(id),
          chatType,
          membership,
          name,
          topic,
          members: memberIds
        }
      })
      .then((response: IConvergenceMessage) => {
        const {createChatResponse} = response;
        return createChatResponse.chatId;
      })
      .catch(error => {
        if (error instanceof ConvergenceServerError &&
          error.code === "chat_already_exists" &&
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

  public remove(chatId: string): Promise<void> {
    Validation.assertNonEmptyString(chatId, "chatId");
    return this._connection.request({
      removeChatRequest: {
        chatId
      }
    }).then(() => {
      return;
    });
  }

  public join(chatId: string): Promise<Chat> {
    Validation.assertNonEmptyString(chatId, "chatId");
    return this._connection.request({
      joinChatRequest: {
        chatId
      }
    }).then((response: IConvergenceMessage) => {
      const {joinChatResponse} = response;
      const chatInfo = this._createChatInfo(joinChatResponse.chatInfo);
      return this._createChat(chatInfo);
    });
  }

  public leave(chatId: string): Promise<void> {
    Validation.assertNonEmptyString(chatId, "chatId");
    return this._connection.request({
      leaveChatRequest: {
        chatId
      }
    }).then(() => {
      return;
    });
  }

  // Methods that apply to Direct  Chats.
  public direct(user: string | DomainUserId): Promise<DirectChat>;
  public direct(users: Array<string | DomainUserId>): Promise<DirectChat>;
  public direct(users: string | DomainUserId | Array<string | DomainUserId>): Promise<DirectChat> {
    if (typeof users === "string" || users instanceof DomainUserId) {
      users = [users];
    }

    const userIds = users.map(user => {
      if (user instanceof DomainUserId) {
        return domainUserIdToProto(user);
      } else {
        return domainUserIdToProto(DomainUserId.normal(user));
      }
    });
    return this._connection.request({
      getDirectChatsRequest: {
        userLists: [{values: userIds}]
      }
    }).then((response: IConvergenceMessage) => {
      const {getDirectChatsResponse} = response;
      const chatData = getDirectChatsResponse.chatInfo[0];
      const info = this._createChatInfo(chatData);
      const chat = this._createChat(info);
      return chat as DirectChat;
    });
  }

  public permissions(chatId: string): ChatPermissionManager {
    return new ChatPermissionManager(chatId, this._connection);
  }

  /**
   * @hidden
   * @internal
   */
  private _createChat(chatInfo: ChatInfo): Chat {
    const messageStream = this._messageStream.pipe(
      filter(msg => msg.chatId === chatInfo.chatId)
    );
    switch (chatInfo.chatType) {
      case ChatTypes.DIRECT:
        return new DirectChat(this._connection, this._identityCache, messageStream, chatInfo);
      case ChatTypes.CHANNEL:
        const groupInfo: MembershipChatInfo = chatInfo as MembershipChatInfo;
        return new ChatChannel(this._connection, this._identityCache, messageStream, groupInfo);
      case ChatTypes.ROOM:
        const roomInfo: MembershipChatInfo = chatInfo as MembershipChatInfo;
        return new ChatRoom(this._connection, this._identityCache, messageStream, roomInfo);
      default:
        throw new Error(`Invalid chat chat type: ${chatInfo.chatType}`);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _createChatInfo(chatData: IChatInfoData): ChatInfo {
    let maxEvent = -1;
    const localUserId = this._connection.session().user().userId;
    const members = chatData.members.map(member => {
      const userId = protoToDomainUserId(member.user);
      if (userId.equals(localUserId)) {
        maxEvent = getOrDefaultNumber(member.maxSeenEventNumber);
      }

      const user = this._identityCache.getUser(userId);

      return {user, maxSeenEventNumber: getOrDefaultNumber(member.maxSeenEventNumber)};
    });
    return {
      chatId: chatData.id,
      chatType: chatData.chatType as ChatType,
      membership: chatData.membership as ChatMembership,
      name: chatData.name,
      topic: chatData.topic,
      createdTime: timestampToDate(chatData.createdTime),
      lastEventTime: timestampToDate(chatData.lastEventTime),
      lastEventNumber: getOrDefaultNumber(chatData.lastEventNumber),
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
  members?: DomainUserIdentifier[];
  ignoreExistsError?: boolean;
}

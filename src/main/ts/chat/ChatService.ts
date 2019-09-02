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
import {Chat} from "./Chat";
import {DirectChat} from "./DirectChat";
import {Observable} from "rxjs";
import {filter, share, tap, map} from "rxjs/operators";
import {ChatChannel} from "./ChatChannel";
import {ChatRoom} from "./ChatRoom";
import {ChatPermissionManager} from "./ChatPermissionManager";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {domainUserIdToProto, toOptional} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier, DomainUserId} from "../identity";
import {ChatInfo, createChatInfo, ChatTypes} from "./ChatInfo";

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

  /**
   * @returns
   *   The current [[ConvergenceSession]].
   */
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

  /**
   * Determines if a Chat with the specified id exists.
   *
   * @param chatId
   *   The chat id to check.
   * @returns
   *   A promise resolved with true if the specified chat exists, or false otherwise.
   */
  public exists(chatId: string): Promise<boolean> {
    Validation.assertNonEmptyString(chatId, "chatId");
    this.session().assertOnline();
    return this._connection.request({
      chatsExistRequest: {
        chatIds: [chatId]
      }
    }).then((response: IConvergenceMessage) => {
      const {chatsExistResponse} = response;
      return chatsExistResponse.exists[0];
    });
  }

  /**
   * Gets a [[Chat]] object for the specified id. The exact subclass returned
   * will depend on the type of [[Chat]] the id refers to.
   *
   * @param chatId
   *   The id of the [[Chat]] to get.
   *
   * @returns
   *   A Promise that will be resolved with the specified Chat, if it exists.
   */
  public get(chatId: string): Promise<Chat> {
    Validation.assertNonEmptyString(chatId, "chatId");
    this.session().assertOnline();
    return this._connection
      .request({
        getChatsRequest: {
          chatIds: [chatId]
        }
      })
      .then((response: IConvergenceMessage) => {
        const {getChatsResponse} = response;
        const chatData = getChatsResponse.chatInfo[0];
        const chatInfo = createChatInfo(this._connection.session(), this._identityCache, chatData);
        return this._createChat(chatInfo);
      });
  }

  //
  // Membership channel related methods.
  //

  /**
   * Gets the [[ChatInfo]] for currently joined [[Chat]]s.
   *
   * @returns
   *   A promise that is resolved with the joined chats.
   */
  public joined(): Promise<ChatInfo[]> {
    if (!this.session().isAuthenticated()) {
      return Promise.resolve([]);
    }
    return this._connection
      .request({
        getJoinedChatsRequest: {}
      })
      .then((response: IConvergenceMessage) => {
        const {getJoinedChatsResponse} = response;
        return getJoinedChatsResponse.chatInfo.map(chatInfo => {
          return createChatInfo(this._connection.session(), this._identityCache, chatInfo);
        });
      });
  }

  /**
   * Creates a new [[Chat]]. The specific type of [[Chat]] created will depend
   * on the options provided.
   *
   * @param options
   *   The options that define how to create the Chat.
   *
   * @returns
   *   A promise that will be resolved with the id of the successfully created
   *   [[Chat]].
   */
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

    this.session().assertOnline();

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

  /**
   * Removes the [[Chat]] with the specified id.
   *
   * @param chatId
   *   The id of the Chat to remove.
   * @returns
   *   A promise that will be resolved when the Chat is successfully removed.
   */
  public remove(chatId: string): Promise<void> {
    Validation.assertNonEmptyString(chatId, "chatId");
    this.session().assertOnline();
    return this._connection.request({
      removeChatRequest: {
        chatId
      }
    }).then(() => undefined);
  }

  /**
   * Joins a [[Chat]] with the specified id.  The [[Chat]] must already exist.
   * The type of Chat returned will vary depdning on what type of Chat the
   * id refers to.
   *
   * @param chatId
   *   The id of an existing [[Chat]] to join.
   * @returns
   *   A Promise resolved with the successfully joined [[Chat]].
   */
  public join(chatId: string): Promise<Chat> {
    Validation.assertNonEmptyString(chatId, "chatId");

    this.session().assertOnline();

    // todo extract message send / handle respnose into external method
    return this._connection.request({
      joinChatRequest: {
        chatId
      }
    }).then((response: IConvergenceMessage) => {
      const {joinChatResponse} = response;
      const chatInfo = createChatInfo(this._connection.session(), this._identityCache, joinChatResponse.chatInfo);
      return this._createChat(chatInfo);
    });
  }

  /**
   * Leaves the specified [[Chat]]. The id must refer to an existing chat
   * that the user is presently joined to.
   *
   * @param chatId
   *   The id of the Chat to leave.
   * @returns
   *   A Promise that will be resolved when the Chat is successfully left.
   */
  public leave(chatId: string): Promise<void> {
    Validation.assertNonEmptyString(chatId, "chatId");
    this.session().assertOnline();
    return this._connection.request({
      leaveChatRequest: {
        chatId
      }
    }).then(() => undefined);
  }

  //
  // Methods that apply to Direct Chats.
  //

  /**
   * Gets a [[DirectChat]] for the communication between the local user and
   * another specified user.
   *
   * @param user
   *   The other user to get the DirectChat for.
   * @returns
   *   A Promise resolved with the specified DirectChat.
   */
  public direct(user: string | DomainUserId): Promise<DirectChat>;

  /**
   * Gets a [[DirectChat]] for the communication between the local user and
   * a set of users.
   *
   * @param users
   *   The other users to get the DirectChat for.
   * @returns
   *   A Promise resolved with the specified DirectChat.
   */
  public direct(users: Array<string | DomainUserId>): Promise<DirectChat>;

  public direct(users: string | DomainUserId | Array<string | DomainUserId>): Promise<DirectChat> {
    this.session().assertOnline();

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
      const chatInfo = createChatInfo(this._connection.session(), this._identityCache, chatData);
      return this._createChat(chatInfo) as DirectChat;
    });
  }

  /**
   * Get the users permissions for the specified chat.
   *
   * @param chatId
   */
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
        return new ChatChannel(this._connection, this._identityCache, messageStream, chatInfo);
      case ChatTypes.ROOM:
        return new ChatRoom(this._connection, this._identityCache, messageStream, chatInfo);
      default:
        throw new Error(`Invalid chat chat type: ${chatInfo.chatType}`);
    }
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

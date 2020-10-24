/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ConvergenceError, ConvergenceEventEmitter, ConvergenceServerError, PagedData} from "../util";
import {
  ChatJoinedEvent,
  ChatLeftEvent,
  ChatMessageEvent,
  IChatEvent,
  UserAddedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserRemovedEvent
} from "./events";
import {isChatMessage, processChatMessage} from "./ChatMessageProcessor";
import {Chat} from "./Chat";
import {DirectChat} from "./DirectChat";
import {Observable} from "rxjs";
import {filter, map, share, tap} from "rxjs/operators";
import {ChatChannel} from "./ChatChannel";
import {ChatRoom} from "./ChatRoom";
import {ChatPermissionManager} from "./ChatPermissionManager";
import {
  domainUserIdToProto,
  getOrDefaultArray,
  getOrDefaultBoolean,
  getOrDefaultNumber,
  jsonToProtoValue,
  toOptional
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserId} from "../identity";
import {ChatTypes, createChatInfo, IChatInfo} from "./IChatInfo";
import {Validation} from "../util/Validation";

import {com} from "@convergence/convergence-proto";
import {IChatSearchCriteria} from "./ChatSearchCriteria";
import {INumberValue} from "../model";
import {TypeChecker} from "../util/TypeChecker";
import {ICreateChatChannelOptions} from "./ICreateChatChannelOptions";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;

/**
 * All the possible events that could be emitted from the [[ChatService]].
 *
 * @module Chat
 */
export declare interface IChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
  readonly CHANNEL_JOINED: string;
  readonly CHANNEL_LEFT: string;
}

const Events: IChatServiceEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedEvent.NAME,
  USER_LEFT: UserLeftEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
  CHANNEL_JOINED: ChatJoinedEvent.NAME,
  CHANNEL_LEFT: ChatLeftEvent.NAME
};
Object.freeze(Events);

interface IChatRecord {
  chat: Chat;
  references: number;
}

/**
 * The `ChatService` is the entry point for chat functionality.  Chat is defined
 * as textual communication limited to either a fixed set of participants, or a
 * [[ChatRoom]] in which any members can send and receive messages.
 *
 * See the [developer guide](https://docs.convergence.io/guide/chat/overview.html)
 * for a few chat examples.
 *
 * @module Chat
 */
export class ChatService extends ConvergenceEventEmitter<IChatEvent> {

  public static readonly Events: IChatServiceEvents = Events;

  /**
   * @hidden
   * @internal
   */
  private static _toChatIdsArray(chatIds: string | string[]): string[] {
    if (TypeChecker.isString(chatIds)) {
      return [chatIds];
    } else if (TypeChecker.isArray(chatIds)) {
      return chatIds;
    } else {
      throw new ConvergenceError("chatIds must be a string or string array: " + chatIds);
    }
  }

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

  /**
   * Searches for existing chats.
   *
   * @param criteria
   *   The criteria to search for chats with.
   *
   * @returns
   *   Chat info objects for matching results.
   */
  public search(criteria: IChatSearchCriteria): Promise<PagedData<IChatInfo>> {
    this.session().assertOnline();
    return this._connection.request({
      chatsSearchRequest: {
        searchTerm: criteria.searchTerm,
        searchFields: criteria.searchFields,
        types: criteria.types,
        membership: criteria.membership,
        limit: jsonToProtoValue(criteria.limit) as INumberValue,
        offset: jsonToProtoValue(criteria.offset) as INumberValue
      }
    }).then((response: IConvergenceMessage) => {
      const {chatsSearchResponse} = response;
      const data = getOrDefaultArray(chatsSearchResponse.data).map(chatInfoData => {
        return createChatInfo(this._connection.session(), this._identityCache, chatInfoData);
      });

      return new PagedData<IChatInfo>(
        data,
        getOrDefaultNumber(chatsSearchResponse.startIndex),
        getOrDefaultNumber(chatsSearchResponse.totalResults));
    });
  }

  /**
   * Determines if a Chat with the specified id exists.
   *
   * @param chatId
   *   The chat id to check.
   * @returns
   *   A promise resolved with true if the specified chat exists, or false otherwise.
   */
  public exists(chatId: string): Promise<boolean>;

  /**
   * Determines if a set of Chats with the specified ids exist.
   *
   * @param chatIds
   *   The chat id to check.
   * @returns
   *   A promise resolved with a map of chat id's to booleans that indicate of
   *   the chat exists.
   */
  public exists(chatIds: string[]): Promise<Map<string, boolean>>;

  public exists(chatIds: string | string[]): Promise<boolean | Map<string, boolean>> {
    let ids = ChatService._toChatIdsArray(chatIds);
    this.session().assertOnline();
    return this._connection.request({
      chatsExistRequest: {
        chatIds: ids
      }
    }).then((response: IConvergenceMessage) => {
      const {chatsExistResponse} = response;
      const exists: boolean[] = getOrDefaultArray(chatsExistResponse.exists);
      if (TypeChecker.isString(chatIds)) {
        return getOrDefaultBoolean(exists[0]);
      } else if (TypeChecker.isArray(chatIds)) {
        return new Map(chatIds.map((chatId: string, index: number) => [chatId, getOrDefaultBoolean(exists[index])]));
      }
    });
  }

  /**
   * Gets a [[Chat]] object for the specified id. The exact subclass returned
   * will depend on the type of [[Chat]] the id refers to.
   *
   * @param chatIds
   *   The and array of the [[Chat]] ids to get.
   *
   * @returns
   *   A Promise that will be resolved with the specified Chat, if it exists.
   */
  public get(chatIds: string[]): Promise<Map<string, Chat>>;

  /**
   * Gets a [[Chat]] object for the specified id. The exact subclass returned
   * will depend on the type of [[Chat]] the id refers to.
   *
   * @param chatId
   *   The id of the [[Chat]] to get.
   *
   * @returns
   *   A Promise that will be resolved with the specified Chats, if they exists.
   */
  public get(chatId: string): Promise<Chat>;

  public get(chatIds: string | string[]): Promise<Chat | Map<string, Chat>> {
    let ids = ChatService._toChatIdsArray(chatIds);
    this.session().assertOnline();
    return this._connection
      .request({
        getChatsRequest: {
          chatIds: ids
        }
      })
      .then((response: IConvergenceMessage) => {
        const {getChatsResponse} = response;
        const chatData = getOrDefaultArray(getChatsResponse.chatInfo);
        const chats = chatData
          .map(d => {
            const c = createChatInfo(this._connection.session(), this._identityCache, d);
            return this._createChat(c);
          });

        if (TypeChecker.isString(chatIds)) {
          return chats[0];
        } else if (TypeChecker.isArray(chatIds)) {
          return new Map(chats.map(chat => [chat.info().chatId, chat]));
        }
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
  public joined(): Promise<IChatInfo[]> {
    if (!this.session().isAuthenticated()) {
      return Promise.resolve([]);
    }
    return this._connection
      .request({
        getJoinedChatsRequest: {}
      })
      .then((response: IConvergenceMessage) => {
        const {getJoinedChatsResponse} = response;
        return getOrDefaultArray(getJoinedChatsResponse.chatInfo).map(chatInfo => {
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
  public create(options: ICreateChatChannelOptions): Promise<string> {
    if (!options) {
      throw new Error("create options must be supplied");
    }

    if (options.type !== "channel" && options.type !== "room") {
      throw new Error(`type must be 'channel' or 'room': ${options.type}`);
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
   * The type of Chat returned will vary depending on what type of Chat the
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

    // todo extract message send / handle response into external method
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
   *
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
   *
   * @returns
   *   A Promise resolved with the specified DirectChat.
   */
  public direct(users: (string | DomainUserId)[]): Promise<DirectChat>;

  /**
   * Get multiple [[DirectChat]]s for the communication between the local user and
   * a sets of users.
   *
   * @param userLists
   *   The lists of users that specify the direct chats to get.
   *
   * @returns
   *   A Promise resolved with the specified DirectChat.
   */
  public direct(userLists: (string | DomainUserId)[][]): Promise<DirectChat[]>;

  public direct(users: (string | DomainUserId) | (string | DomainUserId)[] | (string | DomainUserId)[][]): Promise<DirectChat | DirectChat[]> {

    this.session().assertOnline();

    const {directIds, single} = this.processDirectChatArgs(users);
    const userLists = directIds.map(userList => {
      const values = userList.map(user => {
        if (user instanceof DomainUserId) {
          return domainUserIdToProto(user);
        } else {
          return domainUserIdToProto(DomainUserId.normal(user));
        }
      });

      return {values};
    });

    return this._connection.request({
      getDirectChatsRequest: {
        userLists
      }
    }).then((response: IConvergenceMessage) => {
      const {getDirectChatsResponse} = response;

      const results = getOrDefaultArray(getDirectChatsResponse.chatInfo).map(chatInfoData => {
        const chatInfo = createChatInfo(this._connection.session(), this._identityCache, chatInfoData);
        return this._createChat(chatInfo) as DirectChat;
      });

      if (single) {
        return results[0];
      } else {
        return results;
      }
    });
  }

  /**
   * Gets a [[ChatPermissionManager]] which allows for querying and modifying
   * permissions for the specified chat.
   *
   * @param chatId
   */
  public permissions(chatId: string): ChatPermissionManager {
    return new ChatPermissionManager(chatId, this._connection);
  }

  /**
   * @internal
   * @hidden
   */
  private processDirectChatArgs(users: (string | DomainUserId) | (string | DomainUserId)[] | (string | DomainUserId)[][]): { single: boolean, directIds: (string | DomainUserId)[][] } {
    let directIds: (string | DomainUserId)[][];
    let single = true;
    if (typeof users === "string" || users instanceof DomainUserId) {
      // We have a single user, so we turn it into a single user list.
      directIds = [[users]];
    } else if (Array.isArray(users)) {
      if (users.length === 0) {
        throw new ConvergenceError("users can not be an empty array")
      }

      // We have an array. We need to see if the first element is an Array or not.
      // whatever the first one is, they all have to be that.
      const firstIsArray = Array.isArray(users[0]);
      const allArrays = (users as any[]).every(u => Array.isArray(u));

      if (firstIsArray !== allArrays) {
        throw new ConvergenceError(
          "When passing an array, all elements must be single usernames / DomainUserIds or they must all be arrays.");
      }

      // tslint:disable-next-line:prefer-conditional-expression
      if (firstIsArray) {
        // Here we have multiple direct channels.
        directIds = users as [][];
        single = false;
      } else {
        // we we have a single multi user channel.
        directIds = [users as []]
      }
    } else {
      // We didn't have a single user or an array.
      throw new ConvergenceError("users must be a string, DomainUserId, or an Array");
    }

    return {directIds, single};
  }

  /**
   * @hidden
   * @internal
   */
  private _createChat(chatInfo: IChatInfo): Chat {
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

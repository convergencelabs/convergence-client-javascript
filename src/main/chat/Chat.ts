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

import {ConvergenceError, ConvergenceEventEmitter, PagedData} from "../util";
import {
  ChatEvent,
  ChatEventsMarkedSeenEvent,
  ChatMessageEvent,
  ChatNameChangedEvent,
  ChatTopicChangedEvent,
  IChatEvent,
  UserAddedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserRemovedEvent
} from "./events";
import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {ChatHistoryEntry} from "./history/";
import {Observable} from "rxjs";
import {ChatHistoryEventMapper} from "./history/ChatHistoryEventMapper";
import {getOrDefaultArray, getOrDefaultNumber, timestampToDate, toOptional} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {ConvergenceErrorCodes} from "../util/ConvergenceErrorCodes";
import {Immutable} from "../util/Immutable";
import {createChatInfo, IChatInfo} from "./IChatInfo";

import {com} from "@convergence/convergence-proto";
import {IChatHistorySearchOptions} from "./IChatHistorySearchOptions";
import {IChatMessageResponse} from "./IChatMessageResponse";
import {ChatPermissionManager} from "./ChatPermissionManager";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IChatInfoData = com.convergencelabs.convergence.proto.chat.IChatInfoData;

/**
 * The events that could be emitted from a particular [[Chat]].
 *
 * @module Chat
 */
export interface ChatEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
}

const Events: ChatEvents = {
  MESSAGE: ChatMessageEvent.NAME,
  USER_JOINED: UserJoinedEvent.NAME,
  USER_LEFT: UserLeftEvent.NAME,
  USER_ADDED: UserAddedEvent.NAME,
  USER_REMOVED: UserRemovedEvent.NAME,
};
Object.freeze(Events);

/**
 * The [[Chat]] class is the base class of all Chat types in Convergence. It
 * provides several methods and behaviors that are common to all Chat
 * subclasses, such as the ability to send messages, set a name and topic, etc.
 *
 * @module Chat
 */
export abstract class Chat extends ConvergenceEventEmitter<IChatEvent> {
  public static readonly Events: ChatEvents = Events;

  /**
   * @internal
   */
  protected readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  protected _info: IChatInfo;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
                        identityCache: IdentityCache,
                        messageStream: Observable<IChatEvent>,
                        chatInfo: IChatInfo) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._info = chatInfo;

    messageStream.subscribe(event => {
      this._processEvent(event);
      this._emitEvent(event);
    });
  }

  /**
   * @returns
   *   The [[ConvergenceSession]] this [[Chat]] is associated with.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * @returns
   *   Information which describes the Chat. Subclasses may provide a more
   *   specific subclass of ChatInfo.
   */
  public info(): IChatInfo {
    return {...this._info};
  }

  /**
   * Determines if the Chat is Joined. Chat's must be joined to perform many
   * functions, such as sending messages.
   *
   * @returns
   *   True if the chat is joined, false otherwise.
   */
  public isJoined(): boolean {
    return this._info.joined;
  }

  /**
   * Publishes a chat message to this Chat.
   *
   * @param message
   *   The message to send.
   * @returns
   *   A promise acknowledging that the message has been received by the
   *   server.
   */
  public send(message: string): Promise<IChatMessageResponse> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      publishChatMessageRequest: {
        chatId: this._info.chatId,
        message
      }
    }).then((response: IConvergenceMessage) => {
      const {publishChatMessageResponse} = response;
      const eventNumber = getOrDefaultNumber(publishChatMessageResponse.eventNumber);
      const timestamp = timestampToDate(publishChatMessageResponse.timestamp);
      return {eventNumber, timestamp};
    });
  }

  /**
   * Sets the short descriptive name for this chat.
   *
   * @param name
   *   The name to set.
   *
   * @returns
   *   A promise acknowledging that the name has been successfully set.
   */
  public setName(name: string): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      setChatNameRequest: {
        chatId: this._info.chatId,
        name
      }
    }).then(() => undefined);
  }

  /**
   * Sets the the current topic being discussed in the chat.
   *
   * @param topic
   *   The topic to set.
   *
   * @returns
   *   A promise acknowledging that the topic has been successfully set.
   */
  public setTopic(topic: string): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      setChatTopicRequest: {
        chatId: this._info.chatId,
        topic
      }
    }).then(() => undefined);
  }

  /**
   * Marks the specified event number as having been seen by the local user.
   * It is assumed that all events prior or equal to this event have been
   * seen by the user.
   *
   * @param eventNumber
   *   The event number to mark as set.
   *
   * @returns
   *   A promise acknowledging that seen events have been marked successfully.
   */
  public markSeen(eventNumber: number): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      markChatEventsSeenRequest: {
        chatId: this._info.chatId,
        eventNumber
      }
    }).then(() => {
      return;
    });
  }

  /**
   * Get the history of events for this [[Chat]]. Events consist of messages,
   * users joining / leaving, and a variety of other events depending on the chat
   * type.
   *
   * @param options
   *   Options that define the events the user would like to fetch.
   *
   * @returns
   *   A promise that will be resolved with an array of Chat events that match
   *   the specified search options.
   */
  public getHistory(options?: IChatHistorySearchOptions): Promise<PagedData<ChatHistoryEntry>> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      getChatHistoryRequest: {
        chatId: this._info.chatId,
        startEvent: toOptional(options.startEvent),
        limit: toOptional(options.limit),
        forward: toOptional(options.forward),
        eventFilter: options.eventFilter
      }
    }).then((message: IConvergenceMessage) => {
      const response = message.getChatHistoryResponse;
      const data = getOrDefaultArray(response.data)
        .map(d => ChatHistoryEventMapper.toChatHistoryEntry(d, this._identityCache));
      return new PagedData(data, getOrDefaultNumber(response.startIndex), getOrDefaultNumber(response.totalResults));
    });
  }

  /**
   * Returns the permissions manager for this chat.
   * @returns the permissions manager for this chat.
   */
  public permissions(): ChatPermissionManager {
    return new ChatPermissionManager(this._info.chatId, this._connection);
  }

  /**
   * @hidden
   * @internal
   */
  public _updateWithData(chatData: IChatInfoData) {
    this._info = createChatInfo(this._connection.session(), this._identityCache, chatData);
  }

  /**
   * @hidden
   * @internal
   */
  protected _join(): Promise<void> {
    return this._connection.request({
      joinChatRequest: {
        chatId: this._info.chatId
      }
    }).then((response: IConvergenceMessage) => {
      const {joinChatResponse} = response;
      this._updateWithData(joinChatResponse.chatInfo);
    });
  }

  /**
   * @hidden
   * @internal
   */
  protected _assertJoined(): void {
    if (!this.isJoined()) {
      const message = `Chat channel not joined: ${this._info.chatId}`;
      throw new ConvergenceError(message, ConvergenceErrorCodes.CHAT_NOT_JOINED);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _processEvent(event: IChatEvent): void {
    if (event instanceof ChatEvent) {
      this._info = {...this._info, lastEventNumber: event.eventNumber, lastEventTime: event.timestamp};
    }

    if (event instanceof UserJoinedEvent || event instanceof UserAddedEvent) {
      // TODO should we allow a seen number to come along?
      const user = (event instanceof UserJoinedEvent) ? event.user : event.addedUser;
      const members = this._info.members.slice(0);
      const member = {user, maxSeenEventNumber: -1};
      members.push(member);
      if (event.user.username === this.session().user().username) {
        // TODO this might not be right for rooms
        this._info = {...this._info, joined: true};
      }
      this._info = {...this._info, members};
    } else if (event instanceof UserLeftEvent || event instanceof UserRemovedEvent) {
      const removedUser = (event instanceof UserLeftEvent) ? event.user : event.removedUser;
      if (this.session().user().userId.equals(removedUser.userId)) {
        // TODO this might not be right for rooms
        this._info = {...this._info, joined: false};
      }
      const members = this._info.members.filter(member => !member.user.userId.equals(removedUser.userId));
      this._info = {...this._info, members};
    } else if (event instanceof ChatNameChangedEvent) {
      this._info = {...this._info, name: event.chatName};
    } else if (event instanceof ChatTopicChangedEvent) {
      this._info = {...this._info, topic: event.topic};
    } else if (event instanceof ChatEventsMarkedSeenEvent) {
      const members = this._info.members.slice(0);
      const index = members.findIndex(m => m.user.userId.equals(event.user.userId));
      if (index >= 0) {
        const member = members[index];
        if (member) {
          const newMember = {...member, eventNumber: event.maxSeenEventNumber};
          members[index] = newMember;
          this._info = {...this._info, members};

          if (this.session().user().userId.equals(member.user.userId)) {
            this._info = {...this._info, maxSeenEventNumber:  event.maxSeenEventNumber};
          }
        }
      }
    }

    Immutable.make(this._info);
  }
}

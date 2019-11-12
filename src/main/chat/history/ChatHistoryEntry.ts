/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DomainUser} from "../../identity";
import {Immutable} from "../../util/Immutable";

/**
 * All the possible chat history entries.
 *
 * @category Chat Subsytem
 */
export interface ChatHistoryEntryTypes {
  CREATED: string;
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
  NAME_CHANGED: string;
  TOPIC_CHANGED: string;
}

/**
 * The base class for all chat history entries.  All events that occur in a chat
 * end up in their history, which can be queried with [[Chat.getHistory]] and optionally
 * filtered.
 *
 * @category Chat Subsytem
 */
export abstract class ChatHistoryEntry {

  public static readonly TYPES: ChatHistoryEntryTypes = {
    CREATED: "created",
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    USER_ADDED: "user_added",
    USER_REMOVED: "user_removed",
    NAME_CHANGED: "name_changed",
    TOPIC_CHANGED: "topic_changed"
  };

  /**
   * The type of event. One of [[Types]]
   */
  public readonly type: string;

  /**
   * The ID of the chat on which this event occurred
   */
  public readonly chatId: string;

  /**
   * The unique sequential ID of this event
   */
  public readonly eventNumber: number;

  /**
   * The timestamp at which this event occurred
   */
  public readonly timestamp: Date;

  /**
   * The user that initiated this event
   */
  public readonly user: DomainUser;

  /**
   * @hidden
   * @internal
   *
   * Rather than define the public members here as the norm, we define them above to
   * work around this typedoc bug: https://github.com/TypeStrong/typedoc/issues/1036
   */
  protected constructor(_type: string, _chatId: string, _eventNumber: number, _timestamp: Date, _user: DomainUser) {
    this.type = _type;
    this.chatId = _chatId;
    this.eventNumber = _eventNumber;
    this.timestamp = _timestamp;
    this.user = _user;
  }

}

Immutable.make(ChatHistoryEntry.TYPES);

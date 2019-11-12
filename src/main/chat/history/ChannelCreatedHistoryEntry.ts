/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import { ChatHistoryEntry } from "./ChatHistoryEntry";
import { DomainUser } from "../../identity";
import { Immutable } from "../../util/Immutable";

/**
 * Represents the creation of this chat, regardless of type.
 *
 * @module Chat
 */
export class ChannelCreatedHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.CREATED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The name of the created chat, if specified
     */
    public readonly name: string,

    /**
     * The topic of the created chat, if specified
     */
    public readonly topic: string,

    /**
     * The members of the chat at the time of creation
     */
    public readonly members: DomainUser[]
  ) {
    super(ChannelCreatedHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

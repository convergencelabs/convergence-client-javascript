/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when the current user joins a [[Chat]]. The primary reason for this event
 * is situations in which a user has multiple active sessions (e.g. using the app on
 * two different devices) and one of the sessions joins a [[ChatChannel]].  Since the
 * other session doesn't yet have access to the [[ChatChannel]], applications can
 * listen for this event to update their membership status.
 *
 * Note that this is emitted from the [[ChatService]] as opposed to a [[Chat]].
 *
 * @module Chat
 */
export class ChatJoinedEvent implements IChatEvent {
  public static readonly NAME = "joined";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The id of the chat that was just joined.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

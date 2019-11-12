/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when the current user leaves a [[Chat]]. The primary reason for this event
 * is situations in which a user has multiple active sessions (e.g. using the app on
 * two different devices) and one of the sessions leaves a [[ChatChannel]].  Since the
 * other session may not have an instance of the [[ChatChannel]], applications can
 * listen for this event *outside* of the actual `ChatChannel`.
 *
 * Note that this is emitted from the [[ChatService]] as opposed to a [[Chat]].
 *
 * @category Chat Subsytem
 */
export class ChatLeftEvent implements IChatEvent {
  public static readonly NAME = "left";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatLeftEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The ID of the chat that was just left.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

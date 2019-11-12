/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IChatEvent} from "./IChatEvent";

/**
 * Emitted when a [[Chat]] is deleted.  See [[ChatService.delete]]
 *
 * @module Chat
 */
export class ChatRemovedEvent implements IChatEvent {
  public static readonly NAME = "removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatRemovedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The ID of the chat that was deleted.
     */
    public readonly chatId: string
  ) {
    Object.freeze(this);
  }
}

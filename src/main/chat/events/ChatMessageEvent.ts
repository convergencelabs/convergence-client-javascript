/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when another user sends a message to a particular [[Chat]].
 *
 * @category Chat Subsytem
 */
export class ChatMessageEvent extends ChatEvent {
  public static readonly NAME = "message";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatMessageEvent.NAME;

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
     * The session ID of the user that sent the message
     */
    public readonly sessionId: string,

    /**
     * The text of the message
     */
    public readonly message: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

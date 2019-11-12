/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[Chat]]'s name changes.
 *
 * @category Chat Subsytem
 */
export class ChatNameChangedEvent extends ChatEvent {
  public static readonly NAME = "name_changed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ChatNameChangedEvent.NAME;

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
     * The new name of the chat
     */
    public readonly chatName: string
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

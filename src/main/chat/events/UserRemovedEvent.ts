/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a particular [[DomainUser]] is removed from a [[Chat]].
 *
 * @category Chat Subsytem
 */
export class UserRemovedEvent extends ChatEvent {
  public static readonly NAME = "user_removed";

  /**
   * @inheritdoc
   */
  public readonly name: string = UserRemovedEvent.NAME;

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
     * The user that was removed
     */
    public readonly removedUser: DomainUser
  ) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ChatEvent} from "./ChatEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when a [[DomainUser]] joins a [[Chat]].
 *
 * @category Chat Subsytem
 */
export class UserJoinedEvent extends ChatEvent {
  public static readonly NAME = "user_joined";

  /**
   * @inheritdoc
   */
  public readonly name: string = UserJoinedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string, eventNumber: number, timestamp: Date, user: DomainUser) {
    super(chatId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

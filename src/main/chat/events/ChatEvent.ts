/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IChatEvent} from "./IChatEvent";
import {DomainUser} from "../../identity";

/**
 * A superclass for any events occurring on a particular existing [[Chat]].
 *
 * @module Chat
 */
export abstract class ChatEvent implements IChatEvent {
  public abstract readonly name: string;

  /**
   * The ID of the [[Chat]] on which this event occurred
   */
  public readonly chatId: string;

  /**
   * This event's unique sequential number.  This can be useful when e.g. querying for
   * events on a particular chat ([[Chat.getHistory]]).
   */
  public readonly eventNumber: number;

  /**
   * The timestamp when the event occurred
   */
  public readonly timestamp: Date;

  /**
   * The user associated wth the event
   */
  public readonly user: DomainUser;

  /**
   * @param chatId
   * @param eventNumber
   * @param timestamp
   * @param user
   *
   * @hidden
   * @internal
   *
   * Rather than define the public members here as the norm, we define them above to
   * work around this typedoc bug: https://github.com/TypeStrong/typedoc/issues/1036
   */
  protected constructor(_chatId: string, _eventNumber: number, _timestamp: Date, _user: DomainUser) {
    this.chatId = _chatId;
    this.eventNumber = _eventNumber;
    this.timestamp = _timestamp;
    this.user = _user;
  }
}

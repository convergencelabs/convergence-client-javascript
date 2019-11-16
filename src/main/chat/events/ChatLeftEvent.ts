/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
 * @module Chat
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

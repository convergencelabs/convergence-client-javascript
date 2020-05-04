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

import {DomainUserIdentifier} from "../identity";

/**
 * A set of options when creating a [[ChatChannel]] or [[ChatRoom]].
 *
 * @module Chat
 */
export interface ICreateChatChannelOptions {
  /**
   * The type of chat.  Must be "channel" or "room".
   */
  type: "channel" | "room";

  /**
   * The visibility of the chat room.  Must be "public" or "private".
   *
   * Private chats cannot be joined by a user, but rather added ([[ChatChannel.add]])
   * by another member with the appropriate permissions
   */
  membership: "public" | "private";

  /**
   * The ID which the new chat should have.  Returns an error if a chat with this
   * ID already exists AND `ignoreExistsError` is not true.
   */
  id?: string;

  /**
   * An optional name for the chat.
   */
  name?: string;

  /**
   * An optional topic for the chat.
   */
  topic?: string;

  /**
   * An array of [[DomainUser]]s to which this chat is available.
   */
  members?: DomainUserIdentifier[];

  /**
   * Set to true to ignore an error in the case of an existing desired Chat ID
   */
  ignoreExistsError?: boolean;
}
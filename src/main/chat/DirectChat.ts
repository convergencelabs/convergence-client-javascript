/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Chat} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {IChatEvent} from "./events";
import {IdentityCache} from "../identity/IdentityCache";
import {ChatInfo, ChatMember} from "./ChatInfo";

/**
 * A [[DirectChat]] represents a Chat construct that is defined by a specific
 * set of users. The communication for a given DirectChat will always be
 * between the specified set of users.  This can not change for the life of
 * the DirectChat.
 *
 * @module Chat
 */
export class DirectChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: ChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): DirectChatInfo {
    const info = super.info();
    const localUserId = this.session().user().userId;
    const otherUsers = info.members.filter(member => !member.user.userId.equals(localUserId));
    return {...info, otherUsers};
  }
}

/**
 * The [[ChatInfo]] relevant to a [[DirectChat]].
 *
 * @module Chat
 */
export interface DirectChatInfo extends ChatInfo {
  readonly otherUsers: ChatMember[];
}

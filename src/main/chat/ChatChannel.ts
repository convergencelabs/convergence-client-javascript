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

import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs";
import {MembershipChat, MembershipChatInfo} from "./MembershipChat";
import {IChatEvent} from "./events";
import {IdentityCache} from "../identity/IdentityCache";
import {DomainUserIdentifier, DomainUserId} from "../identity";
import {domainUserIdToProto} from "../connection/ProtocolUtil";

/**
 * A [[ChatChannel]] is a Chat construct that has persistent membership of
 * users whether they are currently connected or not.
 *
 * @module Chat
 */
export class ChatChannel extends MembershipChat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  /**
   * Adds a new user to this ChatChannel.
   *
   * @param user
   *   The user to add to this ChatChannel.
   *
   * @returns
   *   A promise that is resolved when the user has successfully be added.
   */
  public add(user: DomainUserIdentifier): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      addUserToChatChannelRequest: {
        chatId: this._info.chatId,
        userToAdd: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => undefined);
  }
}

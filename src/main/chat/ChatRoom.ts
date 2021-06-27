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

/**
 * A [[ChatRoom]] is a chat construct where users must be connected and present
 * to receive messages. A chat room does not have members beyond who is in the
 * chat room at any given time. Presence in a chat room is determined by
 * session. If a particular session is not connected and currently in a given
 * room, then messages published to that room will not be delivered to that
 * session.
 *
 * If your session is disconnected while joined to a `ChatRoom`, you will automatically
 * rejoin when connectivity is restored.
 *
 * @module Chat
 */
export class ChatRoom extends MembershipChat {

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              messageStream: Observable<IChatEvent>,
              info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);

    connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    connection.on(ConvergenceConnection.Events.CONNECTED, this._setOnline);
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    this._join().catch(e => console.log(e));
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._info = {...this._info, joined: false};
  }
}

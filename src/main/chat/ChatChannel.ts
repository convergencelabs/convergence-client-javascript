/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
 * @category Chat Subsytem
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

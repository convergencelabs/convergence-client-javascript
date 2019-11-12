/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Chat} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events";
import {Observable} from "rxjs";
import {IdentityCache} from "../identity/IdentityCache";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {DomainUserIdentifier, DomainUserId} from "../identity";
import {ChatInfo} from "./ChatInfo";

/**
 * A [[MembershipChat]] chat is a chat construct that has a specific set of
 * users who belong to that chat. A [[MembershipChat]] keeps track of which
 * users are part of the chat.
 *
 * @category Chat Subsytem
 */
export abstract class MembershipChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
                        identityCache: IdentityCache,
                        messageStream: Observable<IChatEvent>,
                        info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): MembershipChatInfo {
    return super.info() as MembershipChatInfo;
  }

  /**
   * Leaves the chat, such that messages will no longer be received. The
   * semantics of this depend on the specific subclass.
   *
   * @returns
   *   A promise that will be resolved when the Chat is left successfully.
   */
  public leave(): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      leaveChatRequest: {
        chatId: this._info.chatId
      }
    }).then(() => undefined);
  }

  /**
   * Removes the specified user from the Chat.
   *
   * @param user
   *   The user to remove from the Chat.
   * @returns
   *   A promise that is resolved when the specified user is successfully
   *   removed from the chat.
   */
  public remove(user: DomainUserIdentifier): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      removeUserFromChatChannelRequest: {
        chatId: this._info.chatId,
        userToRemove: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => undefined);
  }
}

/**
 * The possible types of [[ChatInfo.membership]].
 *
 * @category Chat Subsytem
 */
export type ChatMembership = "public" | "private";

/**
 * The [[ChatInfo]] relevant to a [[MembershipChat]].
 *
 * @category Chat Subsytem
 */
export interface MembershipChatInfo extends ChatInfo {
  readonly membership: ChatMembership;
}

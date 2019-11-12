/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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

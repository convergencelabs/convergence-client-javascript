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

import {IdentityCache} from "../identity/IdentityCache";
import {ChatMembership} from "./MembershipChat";
import {
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  protoToDomainUserId,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceSession} from "../ConvergenceSession";
import {com} from "@convergence/convergence-proto";
import {IChatMember} from "./IChatMember";
import IChatInfoData = com.convergencelabs.convergence.proto.chat.IChatInfoData;

/**
 * The relevant metadata for a [[Chat]].
 *
 * @module Chat
 */
export interface IChatInfo {

  /**
   * The type of chat: [[ChatRoom]], [[ChatChannel]] or [[DirectChat]].
   */
  readonly chatType: ChatType;

  /**
   * The unique ID for this chat.
   */
  readonly chatId: string;

  /**
   * Whether this chat is public or private.  In a private chat, members must be
   * explicitly added by another member with the appropriate permissions
   * (see [[ChatPermission]]).
   */
  readonly membership: ChatMembership;

  /**
   * An optional name for this chat.
   */
  readonly name: string;

  /**
   * An optional topic for this chat.
   */
  readonly topic: string;

  /**
   * The timestamp when this chat was created.
   */
  readonly createdTime: Date;

  /**
   * The timestamp of the most recent event for this chat.
   */
  readonly lastEventTime: Date;

  /**
   * The sequential number of the most recent event for this chat.
   */
  readonly lastEventNumber: number;

  /**
   * The number of the most recent event which *any* member has received.
   */
  readonly maxSeenEventNumber: number;

  /**
   * An array of the current members of this chat.
   */
  readonly members: IChatMember[];

  /**
   * True if the local user is joined to this Chat.
   */
  readonly joined: boolean;
}

/**
 * Use these rather than hardcoded strings to refer to a particular type of Chat.
 *
 * @module Chat
 */
export enum ChatTypes {
  DIRECT = "direct",
  CHANNEL = "channel",
  ROOM = "room"
}

/**
 * The valid strings for a [[ChatInfo.chatType]].
 *
 * @module Chat
 */
export type ChatType = ChatTypes.DIRECT | ChatTypes.CHANNEL | ChatTypes.ROOM;

/**
 * @hidden
 * @internal
 */
export function createChatInfo(session: ConvergenceSession,
                               identityCache: IdentityCache,
                               chatData: IChatInfoData): IChatInfo {
  let maxEvent = -1;
  const localUserId = session.user().userId;

  const members = getOrDefaultArray(chatData.members).map(member => {
    const userId = protoToDomainUserId(member.user);
    if (userId.equals(localUserId)) {
      maxEvent = getOrDefaultNumber(member.maxSeenEventNumber);
    }

    const user = identityCache.getUser(userId);

    return {user, maxSeenEventNumber: getOrDefaultNumber(member.maxSeenEventNumber)};
  });

  return {
    chatId: chatData.id,
    chatType: chatData.chatType as ChatType,
    membership: chatData.membership as ChatMembership,
    name: getOrDefaultString(chatData.name),
    topic: getOrDefaultString(chatData.topic),
    createdTime: timestampToDate(chatData.createdTime),
    lastEventTime: timestampToDate(chatData.lastEventTime),
    lastEventNumber: getOrDefaultNumber(chatData.lastEventNumber),
    maxSeenEventNumber: maxEvent,
    members,
    joined: members.find(m => m.user.userId.equals(localUserId)) !== undefined
  };
}

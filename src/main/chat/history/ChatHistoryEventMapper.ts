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

import {ChatHistoryEntry} from "./ChatHistoryEntry";
import {
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  protoToDomainUserId,
  timestampToDate
} from "../../connection/ProtocolUtil";
import {ConvergenceError} from "../../util";
import {IdentityCache} from "../../identity/IdentityCache";
import { ChannelCreatedHistoryEntry } from "./ChannelCreatedHistoryEntry";
import { MessageChatHistoryEntry } from "./MessageChatHistoryEntry";
import { UserAddedChatHistoryEntry } from "./UserAddedChatHistoryEntry";
import { UserRemovedChatHistoryEntry } from "./UserRemovedChatHistoryEntry";
import { UserJoinedChatHistoryEntry } from "./UserJoinedChatHistoryEntry";
import { UserLeftChatHistoryEntry } from "./UserLeftChatHistoryEntry";
import { NameChangedChatHistoryEntry } from "./NameChangedChatHistoryEntry";
import { TopicChangedChatHistoryEntry } from "./TopicChangedChatHistoryEntry";

import {com} from "@convergence/convergence-proto";
import IChatChannelEventData = com.convergencelabs.convergence.proto.chat.IChatEventData;

/**
 * @hidden
 * @internal
 */
export class ChatHistoryEventMapper {
  public static toChatHistoryEntry(data: IChatChannelEventData, identityCache: IdentityCache): ChatHistoryEntry {
    if (data.created) {
      const {chatId, eventNumber, timestamp, user, name, topic, members} = data.created;
      const memberUsers = getOrDefaultArray(members).map(userId => identityCache.getUser(protoToDomainUserId(userId)));
      return new ChannelCreatedHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        name,
        topic,
        memberUsers
      );
    } else if (data.message) {
      const {chatId, eventNumber, timestamp, user, message} = data.message;
      return new MessageChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        message
      );
    } else if (data.userAdded) {
      const {chatId, eventNumber, timestamp, user, addedUser} = data.userAdded;
      return new UserAddedChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        identityCache.getUser(protoToDomainUserId(addedUser))
      );
    } else if (data.userRemoved) {
      const {chatId, eventNumber, timestamp, user, removedUser} = data.userRemoved;
      return new UserRemovedChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        identityCache.getUser(protoToDomainUserId(removedUser))
      );
    } else if (data.userJoined) {
      const {chatId, eventNumber, timestamp, user} = data.userJoined;
      return new UserJoinedChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user))
      );
    } else if (data.userLeft) {
      const {chatId, eventNumber, timestamp, user} = data.userLeft;
      return new UserLeftChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user))
      );
    } else if (data.topicChanged) {
      const {chatId, eventNumber, timestamp, user, topic} = data.topicChanged;
      return new TopicChangedChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        getOrDefaultString(topic)
      );
    } else if (data.nameChanged) {
      const {chatId, eventNumber, timestamp, user, name} = data.nameChanged;
      return new NameChangedChatHistoryEntry(
        chatId,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        getOrDefaultString(name)
      );
    } else {
      throw new ConvergenceError("Invalid chat event: " + JSON.stringify(data));
    }
  }
}

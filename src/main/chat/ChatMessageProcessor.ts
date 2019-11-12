/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {
  ChatMessageEvent,
  ChatNameChangedEvent,
  ChatRemovedEvent,
  ChatTopicChangedEvent,
  IChatEvent,
  UserAddedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserRemovedEvent
} from "./events";
import {getOrDefaultNumber, getOrDefaultString, protoToDomainUserId, timestampToDate} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {ConvergenceError} from "../util";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;

/**
 * @hidden
 * @internal
 */
export function isChatMessage(message: IConvergenceMessage): boolean {
  return !!message.remoteChatMessage ||
    !!message.userJoinedChat ||
    !!message.userLeftChat ||
    !!message.userAddedToChatChannel ||
    !!message.userRemovedFromChatChannel ||
    !!message.chatRemoved ||
    !!message.chatNameChanged ||
    !!message.chatTopicChanged;
}

/**
 * @hidden
 * @internal
 */
export function processChatMessage(message: IConvergenceMessage, identityCache: IdentityCache): IChatEvent {
  if (message.userJoinedChat) {
    const userJoined = message.userJoinedChat;
    return new UserJoinedEvent(
      userJoined.chatId,
      getOrDefaultNumber(userJoined.eventNumber),
      timestampToDate(userJoined.timestamp),
      identityCache.getUser(protoToDomainUserId(userJoined.user))
    );
  } else if (message.userLeftChat) {
    const userLeft = message.userLeftChat;
    return new UserLeftEvent(
      userLeft.chatId,
      getOrDefaultNumber(userLeft.eventNumber),
      timestampToDate(userLeft.timestamp),
      identityCache.getUser(protoToDomainUserId(userLeft.user))
    );
  } else if (message.userAddedToChatChannel) {
    const userAdded = message.userAddedToChatChannel;
    return new UserAddedEvent(
      userAdded.chatId,
      getOrDefaultNumber(userAdded.eventNumber),
      timestampToDate(userAdded.timestamp),
      identityCache.getUser(protoToDomainUserId(userAdded.user)),
      identityCache.getUser(protoToDomainUserId(userAdded.addedUser))
    );
  } else if (message.userRemovedFromChatChannel) {
    const userRemoved = message.userRemovedFromChatChannel;
    return new UserRemovedEvent(
      userRemoved.chatId,
      getOrDefaultNumber(userRemoved.eventNumber),
      timestampToDate(userRemoved.timestamp),
      identityCache.getUser(protoToDomainUserId(userRemoved.user)),
      identityCache.getUser(protoToDomainUserId(userRemoved.removedUser))
    );
  } else if (message.chatRemoved) {
    const removedMsg = message.chatRemoved;
    return new ChatRemovedEvent(removedMsg.chatId);
  } else if (message.chatNameChanged) {
    const nameSet = message.chatNameChanged;
    return new ChatNameChangedEvent(
      nameSet.chatId,
      getOrDefaultNumber(nameSet.eventNumber),
      timestampToDate(nameSet.timestamp),
      identityCache.getUser(protoToDomainUserId(nameSet.user)),
      getOrDefaultString(nameSet.name),
    );
  } else if (message.chatTopicChanged) {
    const topicSet = message.chatTopicChanged;
    return new ChatTopicChangedEvent(
      topicSet.chatId,
      getOrDefaultNumber(topicSet.eventNumber),
      timestampToDate(topicSet.timestamp),
      identityCache.getUser(protoToDomainUserId(topicSet.user)),
      getOrDefaultString(topicSet.topic)
    );
  } else if (message.remoteChatMessage) {
    const chatMsg = message.remoteChatMessage;
    return new ChatMessageEvent(
      chatMsg.chatId,
      getOrDefaultNumber(chatMsg.eventNumber),
      timestampToDate(chatMsg.timestamp),
      identityCache.getUserForSession(chatMsg.sessionId),
      chatMsg.sessionId,
      getOrDefaultString(chatMsg.message)
    );
  } else {
    throw new ConvergenceError("Invalid chat event");
  }
}

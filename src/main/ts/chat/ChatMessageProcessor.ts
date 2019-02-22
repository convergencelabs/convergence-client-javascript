import {
  ChannelRemovedEvent,
  ChatMessageEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserAddedEvent,
  UserRemovedEvent,
  ChatChannelNameChanged,
  ChatChannelTopicChanged, IChatEvent
} from "./events/";
import {io} from "@convergence-internal/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {getOrDefaultNumber, getOrDefaultString, protoToDomainUserId, timestampToDate} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {ConvergenceError} from "../util";

/**
 * @hidden
 * @internal
 */
export function isChatMessage(message: IConvergenceMessage): boolean {
  return !!message.remoteChatMessage ||
    !!message.userJoinedChatChannel ||
    !!message.userLeftChatChannel ||
    !!message.userAddedToChatChannel ||
    !!message.userRemovedFromChatChannel ||
    !!message.chatChannelRemoved ||
    !!message.chatChannelNameChanged ||
    !!message.chatChannelTopicChanged;
}

/**
 * @hidden
 * @internal
 */
export function processChatMessage(message: IConvergenceMessage, identityCache: IdentityCache): IChatEvent {
  if (message.userJoinedChatChannel) {
    const userJoined = message.userJoinedChatChannel;
    return new UserJoinedEvent(
      userJoined.channelId,
      getOrDefaultNumber(userJoined.eventNumber),
      timestampToDate(userJoined.timestamp),
      identityCache.getUser(protoToDomainUserId(userJoined.user))
    );
  } else if (message.userLeftChatChannel) {
    const userLeft = message.userLeftChatChannel;
    return new UserLeftEvent(
      userLeft.channelId,
      getOrDefaultNumber(userLeft.eventNumber),
      timestampToDate(userLeft.timestamp),
      identityCache.getUser(protoToDomainUserId(userLeft.user))
    );
  } else if (message.userAddedToChatChannel) {
    const userAdded = message.userAddedToChatChannel;
    return new UserAddedEvent(
      userAdded.channelId,
      getOrDefaultNumber(userAdded.eventNumber),
      timestampToDate(userAdded.timestamp),
      identityCache.getUser(protoToDomainUserId(userAdded.user)),
      identityCache.getUser(protoToDomainUserId(userAdded.addedUser))
    );
  } else if (message.userRemovedFromChatChannel) {
    const userRemoved = message.userRemovedFromChatChannel;
    return new UserRemovedEvent(
      userRemoved.channelId,
      getOrDefaultNumber(userRemoved.eventNumber),
      timestampToDate(userRemoved.timestamp),
      identityCache.getUser(protoToDomainUserId(userRemoved.user)),
      identityCache.getUser(protoToDomainUserId(userRemoved.removedUser))
    );
  } else if (message.chatChannelRemoved) {
    const removedMsg = message.chatChannelRemoved;
    return new ChannelRemovedEvent(removedMsg.channelId);
  } else if (message.chatChannelNameChanged) {
    const nameSet = message.chatChannelNameChanged;
    return new ChatChannelNameChanged(
      nameSet.channelId,
      getOrDefaultNumber(nameSet.eventNumber),
      timestampToDate(nameSet.timestamp),
      identityCache.getUser(protoToDomainUserId(nameSet.user)),
      getOrDefaultString(nameSet.name),
    );
  } else if (message.chatChannelTopicChanged) {
    const topicSet = message.chatChannelTopicChanged;
    return new ChatChannelTopicChanged(
      topicSet.channelId,
      getOrDefaultNumber(topicSet.eventNumber),
      timestampToDate(topicSet.timestamp),
      identityCache.getUser(protoToDomainUserId(topicSet.user)),
      getOrDefaultString(topicSet.topic)
    );
  } else if (message.remoteChatMessage) {
    const chatMsg = message.remoteChatMessage;
    return new ChatMessageEvent(
      chatMsg.channelId,
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

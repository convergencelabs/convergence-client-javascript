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
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import {getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";

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
      identityCache.getUser(userJoined.username)
    );
  } else if (message.userLeftChatChannel) {
    const userLeft = message.userLeftChatChannel;
    return new UserLeftEvent(
      userLeft.channelId,
      getOrDefaultNumber(userLeft.eventNumber),
      timestampToDate(userLeft.timestamp),
      identityCache.getUser(userLeft.username)
    );
  } else if (message.userAddedToChatChannel) {
    const userAdded = message.userAddedToChatChannel;
    return new UserAddedEvent(
      userAdded.channelId,
      getOrDefaultNumber(userAdded.eventNumber),
      timestampToDate(userAdded.timestamp),
      identityCache.getUser(userAdded.username),
      identityCache.getUser(userAdded.addedUser)
    );
  } else if (message.userRemovedFromChatChannel) {
    const userRemoved = message.userRemovedFromChatChannel;
    return new UserRemovedEvent(
      userRemoved.channelId,
      getOrDefaultNumber(userRemoved.eventNumber),
      timestampToDate(userRemoved.timestamp),
      identityCache.getUser(userRemoved.username),
      identityCache.getUser(userRemoved.removedUser)
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
      identityCache.getUser(nameSet.username),
      getOrDefaultString(nameSet.name),
    );
  } else if (message.chatChannelTopicChanged) {
    const topicSet = message.chatChannelTopicChanged;
    return new ChatChannelTopicChanged(
      topicSet.channelId,
      getOrDefaultNumber(topicSet.eventNumber),
      timestampToDate(topicSet.timestamp),
      identityCache.getUser(topicSet.username),
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
  }
}

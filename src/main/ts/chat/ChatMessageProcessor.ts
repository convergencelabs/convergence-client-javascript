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
import {timestampToDate} from "../connection/ProtocolUtil";

/**
 * @hidden
 * @internal
 */
export function processChatMessage(message: IConvergenceMessage): IChatEvent {

  if (message.userJoinedChatChannel) {
    const userJoined = message.userJoinedChatChannel;
    return new UserJoinedEvent(
      userJoined.channelId,
      userJoined.eventNumber as number,
      timestampToDate(userJoined.timestamp),
      userJoined.username
    );
  } else if (message.userLeftChatChannel) {
    const userLeft = message.userLeftChatChannel;
    return new UserLeftEvent(
      userLeft.channelId,
      userLeft.eventNumber as number,
      timestampToDate(userLeft.timestamp),
      userLeft.username
    );
  } else if (message.userAddedToChatChannel) {
    const userAdded = message.userAddedToChatChannel;
    return new UserAddedEvent(
      userAdded.channelId,
      userAdded.eventNumber as number,
      timestampToDate(userAdded.timestamp),
      userAdded.username,
      userAdded.addedBy
    );
  } else if (message.userRemovedFromChatChannel) {
    const userRemoved = message.userRemovedFromChatChannel;
    return new UserRemovedEvent(
      userRemoved.channelId,
      userRemoved.eventNumber as number,
      timestampToDate(userRemoved.timestamp),
      userRemoved.username,
      userRemoved.removedBy
    );
  } else if (message.chatChannelRemoved) {
    const removedMsg = message.chatChannelRemoved;
    return new ChannelRemovedEvent(removedMsg.channelId);
  } else if (message.chatChannelNameChanged) {
    const nameSet = message.chatChannelNameChanged;
    return new ChatChannelNameChanged(
      nameSet.channelId,
      nameSet.eventNumber as number,
      timestampToDate(nameSet.timestamp),
      nameSet.name,
      nameSet.setBy
    );
  } else if (message.chatChannelTopicChanged) {
    const topicSet = message.chatChannelTopicChanged;
    return new ChatChannelTopicChanged(
      topicSet.channelId,
      topicSet.eventNumber as number,
      timestampToDate(topicSet.timestamp),
      topicSet.topic,
      topicSet.setBy
    );
  } else if (message.remoteChatMessage) {
    const chatMsg = message.remoteChatMessage;
    // Fixme username
    const username = "";
    return new ChatMessageEvent(
      chatMsg.channelId,
      chatMsg.eventNumber as number,
      timestampToDate(chatMsg.timestamp),
      username,
      chatMsg.sessionId,
      chatMsg.message
    );
  }
}

import {MessageType} from "../connection/protocol/MessageType";
import {
  ChatMessageEvent, UserJoinedEvent, UserLeftEvent, UserAddedEvent,
  UserRemovedEvent, ChannelJoinedEvent, ChannelLeftEvent, ChannelRemovedEvent,
  ChatChannelNameChanged, ChatChannelTopicChanged
} from "./events";
import {RemoteChatMessage} from "../connection/protocol/chat/chatMessage";
import {
  UserLeftChatChannelMessage, UserRemovedFromChatChannelMessage,
  ChatChannelLeftMessage, ChatChannelRemovedMessage
} from "../connection/protocol/chat/leaving";
import {
  UserJoinedChatChannelMessage, UserAddedToChatChannelMessage,
  ChatChannelJoinedMessage
} from "../connection/protocol/chat/joining";
import {ChatChannelNameSetMessage} from "../connection/protocol/chat/setName";
import {ChatChannelTopicSetMessage} from "../connection/protocol/chat/setTopic";

export function processChatMessage(message: any): any {
  switch (message.type) {
    case MessageType.USER_JOINED_CHAT_CHANNEL:
      const userJoined: UserJoinedChatChannelMessage = <UserJoinedChatChannelMessage> message;
      return new UserJoinedEvent(
        userJoined.channelId, userJoined.eventNumber, userJoined.timestamp, userJoined.username);
    case MessageType.USER_LEFT_CHAT_CHANNEL:
      const userLeft: UserLeftChatChannelMessage = <UserLeftChatChannelMessage> message;
      return new UserLeftEvent(
        userLeft.channelId, userLeft.eventNumber, userLeft.timestamp, userLeft.username);
    case MessageType.USER_ADDED_TO_CHAT_CHANNEL:
      const userAdded: UserAddedToChatChannelMessage = <UserAddedToChatChannelMessage> message;
      return new UserAddedEvent(
        userAdded.channelId, userAdded.eventNumber, userAdded.timestamp, userAdded.username, userAdded.addedBy);
    case MessageType.USER_REMOVED_FROM_CHAT_CHANNEL:
      const userRemoved: UserRemovedFromChatChannelMessage = <UserRemovedFromChatChannelMessage> message;
      return new UserRemovedEvent(
        userRemoved.channelId, userRemoved.eventNumber, userRemoved.timestamp,
        userRemoved.username, userRemoved.removedBy);
    case MessageType.CHAT_CHANNEL_JOINED:
      const joined: ChatChannelJoinedMessage = <ChatChannelJoinedMessage> message;
      return new ChannelJoinedEvent(joined.channelId);
    case MessageType.CHAT_CHANNEL_LEFT:
      const left: ChatChannelLeftMessage = <ChatChannelLeftMessage> message;
      return new ChannelLeftEvent(left.channelId);
    case MessageType.CHAT_CHANNEL_REMOVED:
      const leftMsg: ChatChannelRemovedMessage = <ChatChannelRemovedMessage> message;
      return new ChannelRemovedEvent(leftMsg.channelId);
    case MessageType.CHAT_CHANNEL_NAME_CHANGED:
      const nameSet: ChatChannelNameSetMessage = <ChatChannelNameSetMessage> message;
      return new ChatChannelNameChanged(nameSet.channelId, nameSet.eventNumber,
        nameSet.timestamp, nameSet.name, nameSet.changedBy);
    case MessageType.CHAT_CHANNEL_TOPIC_CHANGED:
      const topicSet: ChatChannelTopicSetMessage = message as ChatChannelTopicSetMessage;
      return new ChatChannelTopicChanged(topicSet.channelId, topicSet.eventNumber,
        topicSet.timestamp, topicSet.topic, topicSet.changedBy);
    case MessageType.REMOTE_CHAT_MESSAGE:
      const chatMsg: RemoteChatMessage = message as RemoteChatMessage;
      return new ChatMessageEvent(
        chatMsg.channelId, chatMsg.eventNumber, chatMsg.timestamp,
        chatMsg.username, chatMsg.sessionId, chatMsg.message);
    default:
    // This should be impossible
  }
}

import {MessageType} from "../connection/protocol/MessageType";
import {
  ChatMessageEvent, UserJoinedChannelEvent, UserLeftChannelEvent, UserAddedEvent,
  UserRemovedEvent, ChannelJoinedEvent, ChannelLeftEvent, ChannelRemovedEvent, ChannelNameChanged, ChannelTopicChanged
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
      return new UserJoinedChannelEvent(
        userJoined.channelId, userJoined.eventNumber, userJoined.username, userJoined.timestamp);
    case MessageType.USER_LEFT_CHAT_CHANNEL:
      const userLeft: UserLeftChatChannelMessage = <UserLeftChatChannelMessage> message;
      return new UserLeftChannelEvent(
        userLeft.channelId, userLeft.eventNumber, userLeft.username, userLeft.timestamp);
    case MessageType.USER_ADDED_TO_CHAT_CHANNEL:
      const userAdded: UserAddedToChatChannelMessage = <UserAddedToChatChannelMessage> message;
      return new UserAddedEvent(
        userAdded.channelId, userAdded.eventNumber, userAdded.username, userAdded.addedBy, userAdded.timestamp);
    case MessageType.USER_REMOVED_FROM_CHAT_CHANNEL:
      const userRemoved: UserRemovedFromChatChannelMessage = <UserRemovedFromChatChannelMessage> message;
      return new UserRemovedEvent(
        userRemoved.channelId, userRemoved.eventNumber,
        userRemoved.username, userRemoved.removedBy, userRemoved.timestamp);
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
      return new ChannelNameChanged(nameSet.channelId, nameSet.name);
    case MessageType.CHAT_CHANNEL_TOPIC_CHANGED:
      const topicSet: ChatChannelTopicSetMessage = message as ChatChannelTopicSetMessage;
      return new ChannelTopicChanged(topicSet.channelId, topicSet.topic);
    case MessageType.REMOTE_CHAT_MESSAGE:
      const chatMsg: RemoteChatMessage = message as RemoteChatMessage;
      return new ChatMessageEvent(
        chatMsg.channelId, chatMsg.eventNumber, chatMsg.username,
        chatMsg.sessionId, chatMsg.timestamp, chatMsg.message);
    default:
    // This should be impossible
  }
}

import {io} from "@convergence/convergence-proto";
import IChatChannelEventData = io.convergence.proto.IChatChannelEventData;
import {
  ChannelCreatedHistoryEntry,
  ChatHistoryEntry,
  MessageChatHistoryEntry,
  NameChangedChatHistoryEntry,
  TopicChangedChatHistoryEntry,
  UserAddedChatHistoryEntry,
  UserJoinedChatHistoryEntry,
  UserLeftChatHistoryEntry,
  UserRemovedChatHistoryEntry
} from "./ChatHistoryEntry";
import {getOrDefaultArray, getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";

export class ChatHistoryEventMapper {
  public static toChatHistoryEntry(data: IChatChannelEventData): ChatHistoryEntry {
    if (data.created) {
      const {channel, eventNumber, timestamp, username, name, topic, members} = data.created;
      return new ChannelCreatedHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        name,
        topic,
        getOrDefaultArray(members)
      );
    } else if (data.message) {
      const {channel, eventNumber, timestamp, username, message} = data.message;
      return new MessageChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        message
      );
    } else if (data.userAdded) {
      const {channel, eventNumber, timestamp, username, addedUser} = data.userAdded;
      return new UserAddedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        addedUser
      );
    } else if (data.userRemoved) {
      const {channel, eventNumber, timestamp, username, removedUser} = data.userRemoved;
      return new UserRemovedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        removedUser
      );
    } else if (data.userJoined) {
      const {channel, eventNumber, timestamp, username} = data.userJoined;
      return new UserJoinedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username
      );
    } else if (data.userLeft) {
      const {channel, eventNumber, timestamp, username} = data.userLeft;
      return new UserLeftChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username
      );
    } else if (data.topicChanged) {
      const {channel, eventNumber, timestamp, username, topic} = data.topicChanged;
      return new TopicChangedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        getOrDefaultString(topic)
      );
    } else if (data.nameChanged) {
      const {channel, eventNumber, timestamp, username, name} = data.nameChanged;
      return new NameChangedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        username,
        getOrDefaultString(name)
      );
    } else {
      throw new ConvergenceError("Invalid chat event: " + JSON.stringify(data));
    }
  }
}

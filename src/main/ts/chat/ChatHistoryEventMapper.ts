import {io} from "@convergence/convergence-proto";
import IChatChannelEventData = io.convergence.proto.IChatChannelEventData;
import {
  ChannelCreatedHistoryEntry,
  ChatHistoryEntry,
  MessageChatHistoryEntry, NameChangedChatHistoryEntry, TopicChangedChatHistoryEntry,
  UserAddedChatHistoryEntry, UserJoinedChatHistoryEntry, UserLeftChatHistoryEntry, UserRemovedChatHistoryEntry
} from "./ChatHistoryEntry";
import {timestampToDate} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";

export class ChatHistoryEventMapper {
  public static toChatHistoryEntry(data: IChatChannelEventData): ChatHistoryEntry {
    if (data.created) {
      const {channel, eventNumber, timestamp, user, name, topic, members} = data.created;
      return new ChannelCreatedHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        name,
        topic,
        members
      );
    } else if (data.message) {
      const {channel, eventNumber, timestamp, user, message} = data.message;
      return new MessageChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        message
      );
    } else if (data.userAdded) {
      const {channel, eventNumber, timestamp, user, addedUser} = data.userAdded;
      return new UserAddedChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        addedUser
      );
    } else if (data.userRemoved) {
      const {channel, eventNumber, timestamp, user, removedUser} = data.userRemoved;
      return new UserRemovedChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        removedUser
      );
    } else if (data.userJoined) {
      const {channel, eventNumber, timestamp, user} = data.userJoined;
      return new UserJoinedChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user
      );
    } else if (data.userLeft) {
      const {channel, eventNumber, timestamp, user} = data.userLeft;
      return new UserLeftChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user
      );
    } else if (data.topicChanged) {
      const {channel, eventNumber, timestamp, user, topic} = data.topicChanged;
      return new TopicChangedChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        topic
      );
    } else if (data.nameChanged) {
      const {channel, eventNumber, timestamp, user, name} = data.nameChanged;
      return new NameChangedChatHistoryEntry(
        channel,
        eventNumber as number,
        timestampToDate(timestamp),
        user,
        name
      );
    } else {
      throw new ConvergenceError("Invalid chat event: " + JSON.stringify(data));
    }
  }
}

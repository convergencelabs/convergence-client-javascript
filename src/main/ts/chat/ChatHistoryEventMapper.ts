import {io} from "@convergence-internal/convergence-proto";
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
import {
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  protoToDomainUserId,
  timestampToDate
} from "../connection/ProtocolUtil";
import {ConvergenceError} from "../util";
import {IdentityCache} from "../identity/IdentityCache";

export class ChatHistoryEventMapper {
  public static toChatHistoryEntry(data: IChatChannelEventData, identityCache: IdentityCache): ChatHistoryEntry {
    if (data.created) {
      const {channel, eventNumber, timestamp, user, name, topic, members} = data.created;
      const memberUsers = getOrDefaultArray(members).map(userId => identityCache.getUser(protoToDomainUserId(userId)));
      return new ChannelCreatedHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        name,
        topic,
        memberUsers
      );
    } else if (data.message) {
      const {channel, eventNumber, timestamp, user, message} = data.message;
      return new MessageChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        message
      );
    } else if (data.userAdded) {
      const {channel, eventNumber, timestamp, user, addedUser} = data.userAdded;
      return new UserAddedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        identityCache.getUser(protoToDomainUserId(addedUser))
      );
    } else if (data.userRemoved) {
      const {channel, eventNumber, timestamp, user, removedUser} = data.userRemoved;
      return new UserRemovedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        identityCache.getUser(protoToDomainUserId(removedUser))
      );
    } else if (data.userJoined) {
      const {channel, eventNumber, timestamp, user} = data.userJoined;
      return new UserJoinedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user))
      );
    } else if (data.userLeft) {
      const {channel, eventNumber, timestamp, user} = data.userLeft;
      return new UserLeftChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user))
      );
    } else if (data.topicChanged) {
      const {channel, eventNumber, timestamp, user, topic} = data.topicChanged;
      return new TopicChangedChatHistoryEntry(
        channel,
        getOrDefaultNumber(eventNumber),
        timestampToDate(timestamp),
        identityCache.getUser(protoToDomainUserId(user)),
        getOrDefaultString(topic)
      );
    } else if (data.nameChanged) {
      const {channel, eventNumber, timestamp, user, name} = data.nameChanged;
      return new NameChangedChatHistoryEntry(
        channel,
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

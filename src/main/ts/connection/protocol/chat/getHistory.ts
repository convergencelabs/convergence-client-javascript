import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {
  ChatHistoryEntry, MessageChatHistoryEntry, UserLeftChatHistoryEntry,
  UserJoinedChatHistoryEntry, UserAddedChatHistoryEntry, UserRemovedChatHistoryEntry, ChannelCreatedHistoryEntry,
  NameChangedChatHistoryEntry, TopicChangedChatHistoryEntry
} from "../../../chat/ChatHistoryEntry";
import {ChatChannelNameChanged} from "../../../chat/events";

export interface ChatChannelHistoryRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  startEvent?: number;
  limit?: number;
  forward?: boolean;
  eventFilter?: string[];
}

export function ChatChannelHistoryRequestMessageSerializer(request: ChatChannelHistoryRequestMessage): any {
  return {
    i: request.channelId,
    s: request.startEvent,
    l: request.limit,
    f: request.forward,
    e: request.eventFilter.map(type => toChatChannelEventTypeCode(type))
  };
}

export interface ChatChannelHistoryResponseMessage extends IncomingProtocolNormalMessage {
  entries: ChatHistoryEntry[];
}

export function ChatChannelHistoryResponseMessageDeserializer(body: any): ChatChannelHistoryResponseMessage {
  const e: any[] = body.e;
  const entries: ChatHistoryEntry[] = e.map(entry => ChatHistoryEntryDeserializer(entry));
  const result: ChatChannelHistoryResponseMessage = {
    entries
  };
  return result;
}

export function ChatHistoryEntryDeserializer(body: any): ChatHistoryEntry {
  const type: number = body.e;
  const eventNumber: number = body.n;
  const timestamp: Date = new Date(body.p);
  const username: string = body.u;

  switch (type) {
    case ChatChannelEventTypeCodes.CREATED:
      return new ChannelCreatedHistoryEntry(eventNumber, timestamp, username, body.a, body.o, body.m);
    case ChatChannelEventTypeCodes.MESSAGE:
      const message: string = body.m;
      return new MessageChatHistoryEntry(eventNumber, timestamp, username, message);
    case ChatChannelEventTypeCodes.USER_JOINED:
      return new UserJoinedChatHistoryEntry(eventNumber, timestamp, username);
    case ChatChannelEventTypeCodes.USER_LEFT:
      return new UserLeftChatHistoryEntry(eventNumber, timestamp, username);
    case ChatChannelEventTypeCodes.USER_ADDED:
      const addedBy: string = body.b;
      return new UserAddedChatHistoryEntry(eventNumber, timestamp, username, addedBy);
    case ChatChannelEventTypeCodes.USER_REMOVED:
      const removedBy: string = body.b;
      return new UserRemovedChatHistoryEntry(eventNumber, timestamp, username, removedBy);
    case ChatChannelEventTypeCodes.NAME_CHANGED:
      const name: string = body.a;
      return new NameChangedChatHistoryEntry(eventNumber, timestamp, username, name);
    case ChatChannelEventTypeCodes.TOPIC_CHANGED:
      const topic: string = body.o;
      return new TopicChangedChatHistoryEntry(eventNumber, timestamp, username, topic);
    default:
      throw new Error(`Unexpected chat entry type: ${type}`);
  }
}

const ChatChannelEventTypeCodes = {
  CREATED: 0,
  MESSAGE: 1,
  USER_JOINED: 2,
  USER_LEFT: 3,
  USER_ADDED: 4,
  USER_REMOVED: 5,
  NAME_CHANGED: 6,
  TOPIC_CHANGED: 7
};

function toChatChannelEventTypeCode(type: string): number {
  switch (type) {
    case ChannelCreatedHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.CREATED;
    case MessageChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.MESSAGE;
    case UserJoinedChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.USER_JOINED;
    case UserLeftChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.USER_LEFT;
    case UserAddedChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.USER_ADDED;
    case UserRemovedChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.USER_REMOVED;
    case NameChangedChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.NAME_CHANGED;
    case TopicChangedChatHistoryEntry.TYPE:
      return ChatChannelEventTypeCodes.TOPIC_CHANGED;
    default:
      throw new Error(`Unexpected chat event type: ${type}`);
  }
}

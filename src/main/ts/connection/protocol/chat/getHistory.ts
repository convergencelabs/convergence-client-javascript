import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {
  ChatHistoryEntry, MessageChatHistoryEntry, UserLeftChatHistoryEntry,
  UserJoinedChatHistoryEntry, UserAddedChatHistoryEntry, UserRemovedChatHistoryEntry
} from "../../../chat/ChatHistoryEntry";

export interface ChatChannelHistoryRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  forward?: boolean;
  limit?: number;
  offset?: number;
  eventTypes?: string[];
}

export function ChatChannelHistoryRequestMessageSerializer(request: ChatChannelHistoryRequestMessage): any {
  return {
    i: request.channelId,
    f: request.forward,
    l: request.limit,
    o: request.offset,
    e: request.eventTypes,
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
  const type: string = body.e;
  const eventNumber: number = body.n;
  const timestamp: Date = new Date(body.p);
  const username: string = body.u;

  switch (type) {
    case ChatHistoryEntry.TYPES.MESSAGE:
      const message: string = body.m;
      return new MessageChatHistoryEntry(eventNumber, timestamp, username, message);
    case ChatHistoryEntry.TYPES.USER_JOINED:
      return new UserJoinedChatHistoryEntry(eventNumber, timestamp, username);
    case ChatHistoryEntry.TYPES.USER_LEFT:
      return new UserLeftChatHistoryEntry(eventNumber, timestamp, username);
    case ChatHistoryEntry.TYPES.USER_ADDED:
      const addedBy: string = body.b;
      return new UserAddedChatHistoryEntry(eventNumber, timestamp, username, addedBy);
    case ChatHistoryEntry.TYPES.USER_REMOVED:
      const removedBy: string = body.b;
      return new UserRemovedChatHistoryEntry(eventNumber, timestamp, username, removedBy);
    default:
      throw new Error(`Unexpected chat entry type: ${type}`);
  }
}

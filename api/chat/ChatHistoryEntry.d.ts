export interface ChatHistoryEntryTypes {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
  NAME_CHANGED: string;
  TOPIC_CHANGED: string;
}

export declare abstract class ChatHistoryEntry {

  public static readonly TYPES: ChatHistoryEntryTypes;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
}

export class MessageChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
  public readonly message: string;
}

export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
}

export class UserLeftChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
}

export class UserAddedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
  public readonly addedBy: string;
}

export class UserRemovedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly type: string;
  public readonly eventNumber: number;
  public readonly timestamp: Date;
  public readonly username: string;
  public readonly removedBy: string;
}

export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly channelName: string;
}

export class TopicChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE: string;

  public readonly channelTopic: string;
}

export declare interface ChatHistoryEntryTypes {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
}

export declare abstract class ChatHistoryEntry {
  public static readonly Events: ChatHistoryEntryTypes;

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
  public message: string;
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

export interface ChatHistoryEntryTypes {
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
}

export abstract class ChatHistoryEntry {

  public static readonly TYPES = {
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    USER_ADDED: "user_added",
    USER_REMOVED: "user_removed"
  };

  constructor(public type: string,
              public eventNumber: number,
              public timestamp: Date,
              public username: string) {
  }
}
Object.freeze(ChatHistoryEntry.TYPES);

export class MessageChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "message";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public message: string) {
    super(MessageChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_joined";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string) {
    super(UserJoinedChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

export class UserLeftChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_left";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string) {
    super(UserLeftChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

export class UserAddedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_added";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public addedBy: string) {
    super(UserAddedChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

export class UserRemovedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_removed";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public removedBy: string) {
    super(UserRemovedChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

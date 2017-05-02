export interface ChatHistoryEntryTypes {
  CREATED: string;
  MESSAGE: string;
  USER_JOINED: string;
  USER_LEFT: string;
  USER_ADDED: string;
  USER_REMOVED: string;
  NAME_CHANGED: string;
  TOPIC_CHANGED: string;
}

export abstract class ChatHistoryEntry {

  public static readonly TYPES: ChatHistoryEntryTypes = {
    CREATED: "created",
    MESSAGE: "message",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    USER_ADDED: "user_added",
    USER_REMOVED: "user_removed",
    NAME_CHANGED: "name_changed",
    TOPIC_CHANGED: "topic_changed"
  };

  constructor(public type: string,
              public eventNumber: number,
              public timestamp: Date,
              public username: string) {
  }
}
Object.freeze(ChatHistoryEntry.TYPES);

export class ChannelCreatedHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "created";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public name: string,
              public topic: string,
              public members: string[]) {
    super(ChannelCreatedHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

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

export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "name_changed";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public channelName: string) {
    super(UserRemovedChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

export class TopicChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "topic_changed";

  constructor(eventNumber: number,
              timestamp: Date,
              username: string,
              public channelTopic: string) {
    super(UserRemovedChatHistoryEntry.TYPE, eventNumber, timestamp, username);
    Object.freeze(this);
  }
}

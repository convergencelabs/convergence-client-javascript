import {DomainUser} from "../identity";

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

  /**
   * @hidden
   * @internal
   */
  protected constructor(public readonly type: string,
                        public readonly channelId: string,
                        public readonly eventNumber: number,
                        public readonly timestamp: Date,
                        public readonly user: DomainUser) {
  }
}

Object.freeze(ChatHistoryEntry.TYPES);

export class ChannelCreatedHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "created";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly name: string,
              public readonly topic: string,
              public readonly members: string[]) {
    super(ChannelCreatedHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class MessageChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "message";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly message: string) {
    super(MessageChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_joined";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserJoinedChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class UserLeftChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_left";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserLeftChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class UserAddedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_added";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly addedUser: DomainUser) {
    super(UserAddedChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class UserRemovedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "user_removed";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly removedUser: DomainUser) {
    super(UserRemovedChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "name_changed";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly name: string) {
    super(NameChangedChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

export class TopicChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = "topic_changed";

  /**
   * @hidden
   * @internal
   */
  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser,
              public readonly topic: string) {
    super(TopicChangedChatHistoryEntry.TYPE, channelId, eventNumber, timestamp, user);
    Object.freeze(this);
  }
}

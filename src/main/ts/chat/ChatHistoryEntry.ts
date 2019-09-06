import {DomainUser} from "../identity";
import {Immutable} from "../util/Immutable";

/**
 * All the possible chat history entries.
 */
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

/**
 * The base class for all chat history entries.  All events that occur in a chat
 * end up in their history, which can be queried with [[Chat.getHistory]] and optionally
 * filtered.
 */
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
   * The type of event. One of [[Types]]
   */
  public readonly type: string;

  /**
   * The ID of the chat on which this event occurred
   */
  public readonly chatId: string;

  /**
   * The unique sequential ID of this event
   */
  public readonly eventNumber: number;

  /**
   * The timestamp at which this event occurred
   */
  public readonly timestamp: Date;

  /**
   * The user that initiated this event
   */
  public readonly user: DomainUser;

  /**
   * @hidden
   * @internal
   *
   * Rather than define the public members here as the norm, we define them above to
   * work around this typedoc bug: https://github.com/TypeStrong/typedoc/issues/1036
   */
  protected constructor(_type: string, _chatId: string, _eventNumber: number, _timestamp: Date, _user: DomainUser) {
    this.type = _type;
    this.chatId = _chatId;
    this.eventNumber = _eventNumber;
    this.timestamp = _timestamp;
    this.user = _user;
  }

}

Immutable.make(ChatHistoryEntry.TYPES);

/**
 * Represents the creation of this chat, regardless of type.
 */
export class ChannelCreatedHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.CREATED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The name of the created chat, if specified
     */
    public readonly name: string,

    /**
     * The topic of the created chat, if specified
     */
    public readonly topic: string,

    /**
     * The members of the chat at the time of creation
     */
    public readonly members: DomainUser[]
  ) {
    super(ChannelCreatedHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a message that was sent to this chat.  Analogous to a [[ChatMessageEvent]].
 */
export class MessageChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.MESSAGE;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The text of the message.
     */
    public readonly message: string
  ) {
    super(MessageChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a user joining this chat.  Analogous to a [[UserJoinedEvent]].
 */
export class UserJoinedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.USER_JOINED;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserJoinedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a user leaving this chat.  Analogous to a [[UserLeftEvent]].
 */
export class UserLeftChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.USER_LEFT;

  /**
   * @hidden
   * @internal
   */
  constructor(chatId: string,
              eventNumber: number,
              timestamp: Date,
              user: DomainUser) {
    super(UserLeftChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a user being added this chat.  Analogous to a [[UserAddedEvent]].
 */
export class UserAddedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.USER_ADDED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The user that was added.
     */
    public readonly addedUser: DomainUser
  ) {
    super(UserAddedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a user being removed from this chat.  Analogous to a [[UserRemovedEvent]].
 */
export class UserRemovedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.USER_REMOVED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The user that was removed.
     */
    public readonly removedUser: DomainUser
  ) {
    super(UserRemovedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a chat's name being changed.  Analogous to a [[ChatNameChangedEvent]].
 */
export class NameChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.NAME_CHANGED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The new name for the chat.
     */
    public readonly name: string
  ) {
    super(NameChangedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

/**
 * Represents a chat's topic being changed.  Analogous to a [[ChatTopicChangedEvent]].
 */
export class TopicChangedChatHistoryEntry extends ChatHistoryEntry {
  public static readonly TYPE = ChatHistoryEntry.TYPES.TOPIC_CHANGED;

  /**
   * @hidden
   * @internal
   */
  constructor(
    chatId: string,
    eventNumber: number,
    timestamp: Date,
    user: DomainUser,

    /**
     * The new topic for the chat.
     */
    public readonly topic: string
  ) {
    super(TopicChangedChatHistoryEntry.TYPE, chatId, eventNumber, timestamp, user);
    Immutable.make(this);
  }
}

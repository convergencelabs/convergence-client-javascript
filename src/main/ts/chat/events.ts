import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  readonly channelId: string;
}

export abstract class ChatChannelEvent implements ChatEvent {
  public abstract readonly name: string;

  constructor(public readonly channelId: string,
              public readonly eventNumber: number,
              public readonly timestamp: Date) {
  }
}

export class ChatMessageEvent extends ChatChannelEvent {
  public static readonly NAME = "message";
  public readonly name: string = ChatMessageEvent.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly message: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class UserJoinedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_joined";
  public readonly name: string = UserJoinedEvent.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class UserLeftEvent extends ChatChannelEvent {
  public static readonly NAME = "user_left";
  public readonly name: string = UserLeftEvent.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class UserAddedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_added";
  public readonly name: string = UserAddedEvent.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string,
              public readonly addedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class UserRemovedEvent extends ChatChannelEvent {
  public static readonly NAME = "user_removed";
  public readonly name: string = UserRemovedEvent.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly username: string,
              public readonly removedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class ChatChannelNameChanged extends ChatChannelEvent {
  public static readonly NAME = "name_changed";
  public readonly name: string = ChatChannelNameChanged.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly channelName: string,
              public readonly changedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class ChatChannelTopicChanged extends ChatChannelEvent {
  public static readonly NAME = "topic_changed";
  public readonly name: string = ChatChannelTopicChanged.NAME;

  constructor(channelId: string,
              eventNumber: number,
              timestamp: Date,
              public readonly topic: string,
              public readonly changedBy: string) {
    super(channelId, eventNumber, timestamp);
    Object.freeze(this);
  }
}

export class ChannelJoinedEvent implements ChatEvent {
  public static readonly NAME = "joined";
  public readonly name: string = ChannelJoinedEvent.NAME;

  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}

export class ChannelLeftEvent implements ChatEvent {
  public static readonly NAME = "left";
  public readonly name: string = ChannelLeftEvent.NAME;

  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}

export class ChannelRemovedEvent implements ChatEvent {
  public static readonly NAME = "removed";
  public readonly name: string = ChannelRemovedEvent.NAME;

  constructor(public readonly channelId: string) {
    Object.freeze(this);
  }
}

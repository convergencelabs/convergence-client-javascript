import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  readonly channelId: string;
}

export class ChatMessageEvent implements ChatEvent {
  public static readonly NAME = "message";
  public readonly name: string = ChatMessageEvent.NAME;

  constructor(public readonly channelId: string,
              public readonly eventNo: number,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number,
              public readonly message: string) {
    Object.freeze(this);
  }
}

export class UserJoinedChannelEvent implements ChatEvent {
  public static readonly NAME = "user_joined";
  public readonly name: string = UserJoinedChannelEvent.NAME;

  constructor(public readonly channelId: string,
              public readonly eventNo: number,
              public readonly username: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

export class UserLeftChannelEvent implements ChatEvent {
  public static readonly NAME = "user_left";
  public readonly name: string = UserLeftChannelEvent.NAME;

  constructor(public readonly channelId: string,
              public readonly eventNo: number,
              public readonly username: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

export class UserAddedEvent implements ChatEvent {
  public static readonly NAME = "user_added";
  public readonly name: string = UserAddedEvent.NAME;

  constructor(public readonly channelId: string,
              public readonly eventNo: number,
              public readonly username: string,
              public readonly addedBy: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

export class UserRemovedEvent implements ChatEvent {
  public static readonly NAME = "user_removed";
  public readonly name: string = UserRemovedEvent.NAME;

  constructor(public readonly channelId: string,
              public readonly eventNo: number,
              public readonly username: string,
              public readonly removedBy: string,
              public readonly timestamp: number) {
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

export class ChannelNameChanged implements ChatEvent {
  public static readonly NAME = "name_changed";
  public readonly name: string = ChannelNameChanged.NAME;

  constructor(public readonly channelId: string,
              public readonly channelName: string) {
    Object.freeze(this);
  }
}

export class ChannelTopicChanged implements ChatEvent {
  public static readonly NAME = "topic_changed";
  public readonly name: string = ChannelTopicChanged.NAME;

  constructor(public readonly channelId: string,
              public readonly topic: string) {
    Object.freeze(this);
  }
}

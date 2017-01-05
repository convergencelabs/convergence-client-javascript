import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export class ChatMessageEvent implements ChatEvent {
  public static readonly NAME = "message";
  public name: string = ChatMessageEvent.NAME;

  constructor(public readonly roomId: string,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number,
              public readonly message: string) {
    Object.freeze(this);
  }
}

export class UserJoinedEvent implements ChatEvent {
  public static readonly NAME = "user_joined";
  public name: string = UserJoinedEvent.NAME;

  constructor(public readonly roomId: string,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

export class UserLeftEvent implements ChatEvent {
  public static readonly NAME = "user_left";
  public name: string = UserLeftEvent.NAME;

  constructor(public readonly roomId: string,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

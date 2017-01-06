import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  readonly roomId: string;
  readonly username: string;
  readonly sessionId: string;
  readonly timestamp: number;
}

export class ChatMessageEvent implements ChatEvent {
  public static readonly NAME = "message";
  public readonly name: string = ChatMessageEvent.NAME;

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
  public readonly name: string = UserJoinedEvent.NAME;

  constructor(public readonly roomId: string,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

export class UserLeftEvent implements ChatEvent {
  public static readonly NAME = "user_left";
  public readonly name: string = UserLeftEvent.NAME;

  constructor(public readonly roomId: string,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly timestamp: number) {
    Object.freeze(this);
  }
}

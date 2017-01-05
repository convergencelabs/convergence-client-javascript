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

  constructor(public roomId: string,
              public username: string,
              public sessionId: string,
              public timestamp: number,
              public message: string) {
    Object.freeze(this);
  }
}

export class UserJoinedEvent implements ChatEvent {
  public static readonly NAME = "user_joined";
  public name: string = UserJoinedEvent.NAME;

  constructor(public roomId: string,
              public username: string,
              public sessionId: string,
              public timestamp: number) {
    Object.freeze(this);
  }
}

export class UserLeftEvent implements ChatEvent {
  public static readonly NAME = "user_left";
  public name: string = UserLeftEvent.NAME;

  constructor(public roomId: string,
              public username: string,
              public sessionId: string,
              public timestamp: number) {
    Object.freeze(this);
  }
}

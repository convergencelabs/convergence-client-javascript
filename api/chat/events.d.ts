import {ConvergenceEvent} from "../util/ConvergenceEvent";

export interface ChatEvent extends ConvergenceEvent {
  roomId: string;
  username: string;
  sessionId: string;
  timestamp: number;
}

export declare class ChatMessageEvent implements ChatEvent {
  public readonly name: string;
  public readonly roomId: string;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly timestamp: number;
  public readonly message: string;
}

export declare class  UserJoinedEvent implements ChatEvent {
  public readonly name: string;
  public readonly roomId: string;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly timestamp: number;
}

export declare class  UserLeftEvent implements ChatEvent {
  public readonly name: string;
  public readonly roomId: string;
  public readonly username: string;
  public readonly sessionId: string;
  public readonly timestamp: number;
}

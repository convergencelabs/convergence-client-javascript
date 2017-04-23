import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatChannelType} from "./ChatService";
import {ChatEvent} from "./events";
import {Session} from "../Session";

export declare interface ChatChannelEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
  readonly JOINED: string;
  readonly LEFT: string;
}

export declare interface ChatChannelInfo {
  readonly channelType: ChatChannelType;
  readonly channelId: string;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly eventCount: number;
  readonly unseenCount: number;
  readonly private: boolean;
}

export declare abstract class ChatChannel extends ConvergenceEventEmitter<ChatEvent> {
  public readonly Events: ChatChannelEvents;

  public session(): Session;

  public type(): ChatChannelType;

  public info(): ChatChannelInfo;

  public isJoined(): boolean;

  public send(message: string): Promise<void>;

  public name(name: string): Promise<void>;

  public topic(topic: string): Promise<void>;

  public seen(seqNo: number): Promise<void>;

  public history(eventTypes?: string[]): Promise<MessageEvent>;
}

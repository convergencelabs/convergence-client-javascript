import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatChannelType} from "./ChatService";
import {ChatEvent} from "./events";
import {Session} from "../Session";
import {ChatHistoryEntry} from "./ChatHistoryEntry";

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
  readonly channelMembership: string;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEvent: number;
  readonly members: string[];
}

export declare abstract class ChatChannel extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatChannelEvents;

  public session(): Session;

  public dispose(): void;

  public info(): ChatChannelInfo;

  public isJoined(): boolean;

  public send(message: string): Promise<void>;

  public setName(name: string): Promise<void>;

  public setTopic(topic: string): Promise<void>;

  public markSeen(seqNo: number): Promise<void>;

  public getHistory(options?: ChatHistorySearchOptions): Promise<ChatHistoryEntry[]>;
}

export declare interface ChatHistorySearchOptions {
  startEvent?: number;
  limit?: number;
  forward?: boolean;
  eventFilter?: string[];
}

import {Session} from "../Session";
import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {DirectChatChannel} from "./DirectChatChannel";

export interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
  readonly JOINED: string;
  readonly LEFT: string;
}

export declare type ChatChannelType = "direct" | "group" | "room";

export declare class ChatService extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatServiceEvents;

  public session(): Session;

  public findChannels(criteria: ChatSearchCriteria): Promise<ChatChannelInfo[]>

  public exists(channelId: string): Promise<boolean>;

  public get(channelId: string): Promise<ChatChannel>;

  // Methods that apply to Group / Room Chat Channels.
  public joined(): Promise<ChatChannelInfo[]>;

  public create(options: CreateChatChannelOptions): Promise<string>;

  public remove(channelId: string): Promise<void>;

  public join(channelId: string): Promise<ChatChannelInfo>;

  public leave(channelId: string): Promise<void>;

  // Methods that apply to Direct Chat Channels.
  public direct(username: string): Promise<DirectChatChannel>
  public direct(usernames: string[]): Promise<DirectChatChannel>
  public direct(usernames: string | string[]): Promise<DirectChatChannel>;
}

export declare interface ChatSearchCriteria {
  type?: string;
  name?: string;
  topic?: string;
}

export declare interface CreateChatChannelOptions {
  type: string;
  membership: string;
  id?: string;
  name?: string;
  topic?: string;
  members?: string[];
  ignoreExistsError?: boolean;
}

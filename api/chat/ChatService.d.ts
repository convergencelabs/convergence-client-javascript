import {Session} from "../Session";
import {ChatRoom} from "./ChatRoom";
import {ChatEvent} from "./events";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ChatChannelInfo, ChatChannel} from "./ChatChannel";
import {SingleUserChat} from "./SingleUserChatChannel";
import {Observable} from "rxjs";

export interface ChatServiceEvents {
  readonly MESSAGE: string;
  readonly USER_JOINED: string;
  readonly USER_LEFT: string;
  readonly USER_ADDED: string;
  readonly USER_REMOVED: string;
  readonly JOINED: string;
  readonly LEFT: string;
}

export declare type ChatChannelType = "user" | "group" | "room";

export declare class ChatService extends ConvergenceEventEmitter<ChatEvent> {
  public static readonly Events: ChatServiceEvents;

  public session(): Session;

  public search(criteria: ChatSearchCriteria): Promise<ChatChannelInfo[]>

  public get(channelId: string): Promise<ChatChannel>;

  // Methods that apply to Group Chat Channels.
  public joined(): Promise<ChatChannelInfo[]>;

  public create(options: CreateChatChannelOptions): Promise<string>;

  public remove(channelId: string): Promise<void>;

  public join(channelId: string): Promise<void>;

  public leave(channelId: string): Promise<void>;

  // Methods that apply to Single User Chat Channels.
  public direct(userId: string): Promise<SingleUserChat>;
}

export declare interface ChatSearchCriteria {
  type?: string;
  name?: string;
  topic?: string;
}

export declare interface CreateChatChannelOptions {
  id?: string;
  type: string;
  name?: string;
  topic?: string;
  private?: boolean;
}

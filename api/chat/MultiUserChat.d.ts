import {ChatChannelInfo} from "./ChatChannel";

export declare class MultiUserChat extends MessageChannel {
  public info(): MultiUserChatInfo;

  public leave(): Promise<void>;

  public add(userId: string): Promise<void>;

  public remove(userId: string): Promise<void>;
}

export declare interface MultiUserChatInfo extends ChatChannelInfo {
  readonly members: string[];
}

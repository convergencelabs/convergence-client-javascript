import {ChatChannelInfo, ChatChannel} from "./ChatChannel";

export declare class MembershipChatChannel extends ChatChannel {

  public info(): MembershipChatChannelInfo;

  public leave(): Promise<void>;

  public remove(username: string): Promise<void>;
}

export declare type ChatChannelMembership = "public" | "private";

export declare interface MembershipChatChannelInfo extends ChatChannelInfo {
  readonly channelMembership: ChatChannelMembership;
}

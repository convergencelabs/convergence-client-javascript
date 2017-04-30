import {MembershipChatChannel, MembershipChatChannelInfo} from "./MembershipChatChannel";

export declare class GroupChatChannel extends MembershipChatChannel {
  public add(username: string): Promise<void>;
}

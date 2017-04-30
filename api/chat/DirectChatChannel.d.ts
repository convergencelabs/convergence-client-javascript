import {ChatChannelInfo, ChatChannel} from "./ChatChannel";

export declare class DirectChatChannel extends ChatChannel {
  public info(): DirectChatChannelInfo;
}

export declare interface DirectChatChannelInfo extends ChatChannelInfo {
  readonly otherUsers: string[];
}

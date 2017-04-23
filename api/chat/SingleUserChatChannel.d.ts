import {ChatChannelInfo, ChatChannel} from "./ChatChannel";

export declare class SingleUserChat extends ChatChannel {
  public info(): SingleUserChatInfo;
}

export declare interface SingleUserChatInfo extends ChatChannelInfo {
  readonly user: string;
}

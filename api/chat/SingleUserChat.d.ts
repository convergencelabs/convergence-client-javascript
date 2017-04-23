import {ChatChannelInfo} from "./ChatChannel";

export declare class SingleUserChat extends MessageChannel {
  public info(): SingleUserChatInfo;
}

export declare interface SingleUserChatInfo extends ChatChannelInfo {
  readonly user: string;
}

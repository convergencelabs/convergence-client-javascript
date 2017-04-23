import {ChatChannelType} from "../../../chat/ChatService";
import {ChatChannelMembership} from "../../../chat/MultiUserChatChannel";

export interface ChatChannelInfoData {
  readonly channelId: string;
  readonly channelType: ChatChannelType;
  readonly channelMembership?: ChatChannelMembership;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly eventCount: number;
  readonly unseenCount: number;
  readonly members: string[];
}

export function ChannelInfoDataDeserializer(info: any): ChatChannelInfoData {
  const result: ChatChannelInfoData = {
    channelType: info.p,
    channelId: info.i,
    channelMembership: info.cm,
    name: info.n,
    topic: info.o,
    createdTime: info.c,
    lastEventTime: info.l,
    eventCount: info.ec,
    unseenCount: info.uc,
    members: info.m,
  };
  Object.freeze(result);
  return result;
}

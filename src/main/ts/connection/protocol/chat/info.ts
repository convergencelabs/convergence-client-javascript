import {ChatChannelType} from "../../../chat/ChatService";
import {ChatChannelMembership} from "../../../chat/MembershipChatChannel";

export interface ChatChannelInfoData {
  readonly channelId: string;
  readonly channelType: ChatChannelType;
  readonly channelMembership?: ChatChannelMembership;
  readonly name: string;
  readonly topic: string;
  readonly createdTime: Date;
  readonly lastEventTime: Date;
  readonly lastEventNumber: number;
  readonly maxSeenEvent: number;
  readonly members: string[];
}

export function ChannelInfoDataDeserializer(info: any): ChatChannelInfoData {
  const result: ChatChannelInfoData = {
    channelId: info.i,
    channelType: info.p,
    channelMembership: info.cm,
    name: info.n,
    topic: info.o,
    createdTime: info.c,
    lastEventTime: info.l,
    lastEventNumber: info.ec,
    maxSeenEvent: info.ls,
    members: info.m
  };
  return result;
}

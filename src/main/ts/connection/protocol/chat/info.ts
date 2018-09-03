import {ChatChannelType} from "../../../chat/";
import {ChatChannelMembership} from "../../../chat/MembershipChatChannel";

/**
 * @hidden
 * @internal
 */
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

/**
 * @hidden
 * @internal
 */
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

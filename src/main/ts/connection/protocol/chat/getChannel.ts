import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {ChatChannelInfoData, ChannelInfoDataDeserializer} from "./info";

export interface GetJoinedChannelsRequestMessage extends OutgoingProtocolRequestMessage {
}

export function GetJoinedChannelsRequestMessageSerializer(request: GetJoinedChannelsRequestMessage): any {
  return {};
}

export interface GetChatChannelsRequestMessage extends OutgoingProtocolRequestMessage {
  channelIds: string[];
}

export function GetChatChannelsRequestMessageSerializer(request: GetChatChannelsRequestMessage): any {
  return {
    i: request.channelIds
  };
}

export interface GetChatChannelsResponseMessage extends IncomingProtocolResponseMessage {
  channels: ChatChannelInfoData[];
}

export function GetChatChannelsResponseMessageDeserializer(body: any): GetChatChannelsResponseMessage {
  const c: any[] = body.c;
  const channels: ChatChannelInfoData[] = c.map(info => ChannelInfoDataDeserializer(info));
  const result: GetChatChannelsResponseMessage = {
    channels
  };
  return result;
}

export interface GetDirectChannelsRequestMessage extends OutgoingProtocolRequestMessage {
  channelUsernames: string[][];
}

export function GetDirectChannelsRequestMessage(request: GetDirectChannelsRequestMessage): any {
  return {
    u: request.channelUsernames
  };
}

export interface SearchChatChannelsRequestMessage extends OutgoingProtocolRequestMessage {

}

export function SearchChatChannelsRequestMessageSerializer(request: SearchChatChannelsRequestMessage): any {
  return {

  };
}

import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {ChatChannelInfoData, ChannelInfoDataDeserializer} from "./info";

/**
 * @hidden
 * @internal
 */
export interface GetJoinedChannelsRequestMessage extends OutgoingProtocolRequestMessage {
}

/**
 * @hidden
 * @internal
 */
export function GetJoinedChannelsRequestMessageSerializer(request: GetJoinedChannelsRequestMessage): any {
  return {};
}

/**
 * @hidden
 * @internal
 */
export interface GetChatChannelsRequestMessage extends OutgoingProtocolRequestMessage {
  channelIds: string[];
}

/**
 * @hidden
 * @internal
 */
export function GetChatChannelsRequestMessageSerializer(request: GetChatChannelsRequestMessage): any {
  return {
    i: request.channelIds
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetChatChannelsResponseMessage extends IncomingProtocolResponseMessage {
  channels: ChatChannelInfoData[];
}

/**
 * @hidden
 * @internal
 */
export function GetChatChannelsResponseMessageDeserializer(body: any): GetChatChannelsResponseMessage {
  const c: any[] = body.c;
  const channels: ChatChannelInfoData[] = c.map(info => ChannelInfoDataDeserializer(info));
  const result: GetChatChannelsResponseMessage = {
    channels
  };
  return result;
}

/**
 * @hidden
 * @internal
 */
export interface GetDirectChannelsRequestMessage extends OutgoingProtocolRequestMessage {
  channelUsernames: string[][];
}

/**
 * @hidden
 * @internal
 */
export function GetDirectChannelsRequestMessage(request: GetDirectChannelsRequestMessage): any {
  return {
    u: request.channelUsernames
  };
}

/**
 * @hidden
 * @internal
 */
export interface SearchChatChannelsRequestMessage extends OutgoingProtocolRequestMessage {

}

/**
 * @hidden
 * @internal
 */
export function SearchChatChannelsRequestMessageSerializer(request: SearchChatChannelsRequestMessage): any {
  return {

  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelExistsRequestMessage extends OutgoingProtocolRequestMessage {
  channelIds: string[];
}

/**
 * @hidden
 * @internal
 */
export function ChatChannelExistsRequestMessageSerializer(request: ChatChannelExistsRequestMessage): any {
  return {
    i: request.channelIds
  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelExistsResponseMessage extends IncomingProtocolResponseMessage {
  exists: boolean[];
}

/**
 * @hidden
 * @internal
 */
export function ChatChannelExistsResponseMessageDeserializer(body: any): ChatChannelExistsResponseMessage {
  const result: ChatChannelExistsResponseMessage = {
    exists: body.e
  };
  return result;
}

import {IncomingProtocolNormalMessage, IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import {ChatChannelInfoData, ChannelInfoDataDeserializer} from "./info";

/**
 * @hidden
 * @internal
 */
export interface JoinChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

/**
 * @hidden
 * @internal
 */
export function JoinChatChannelRequestMessageSerializer(request: JoinChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

/**
 * @hidden
 * @internal
 */
export interface JoinChatChannelResponseMessage extends IncomingProtocolResponseMessage {
  channel: ChatChannelInfoData;
}

/**
 * @hidden
 * @internal
 */
export function JoinChatChannelResponseMessageDeserializer(body: any): JoinChatChannelResponseMessage {
  const result: JoinChatChannelResponseMessage = {
    channel: ChannelInfoDataDeserializer(body.c)
  };
  return result;
}

/**
 * @hidden
 * @internal
 */
export interface UserJoinedChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  username: string;
}

/**
 * @hidden
 * @internal
 */
export function UserJoinedChatChannelMessageDeserializer(body: any): UserJoinedChatChannelMessage {
  const result: UserJoinedChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    timestamp: new Date(body.p),
    username: body.u
  };
  return result;
}

/**
 * @hidden
 * @internal
 */
export interface AddUserToChatChannelMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  username: string;
}

/**
 * @hidden
 * @internal
 */
export function AddUserToChatChannelMessageSerializer(request: AddUserToChatChannelMessage): any {
  return {
    i: request.channelId,
    u: request.username
  };
}

/**
 * @hidden
 * @internal
 */
export interface UserAddedToChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  username: string;
  addedBy: string;
}

/**
 * @hidden
 * @internal
 */
export function UserAddedToChatChannelMessageDeserializer(body: any): UserAddedToChatChannelMessage {
  const result: UserAddedToChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    timestamp: new Date(body.p),
    addedBy: body.b,
    username: body.u
  };
  return result;
}

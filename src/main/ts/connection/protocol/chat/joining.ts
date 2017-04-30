import {IncomingProtocolNormalMessage, IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import {ChatChannelInfoData, ChannelInfoDataDeserializer} from "./info";

export interface JoinChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

export function JoinChatChannelRequestMessageSerializer(request: JoinChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

export interface JoinChatChannelResponseMessage extends IncomingProtocolResponseMessage {
  channel: ChatChannelInfoData;
}

export function JoinChatChannelResponseMessageDeserializer(body: any): JoinChatChannelResponseMessage {
  const result: JoinChatChannelResponseMessage = {
    channel: ChannelInfoDataDeserializer(body.c)
  };
  return result;
}

export interface UserJoinedChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  username: string;
}

export function UserJoinedChatChannelMessageDeserializer(body: any): UserJoinedChatChannelMessage {
  const result: UserJoinedChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    timestamp: new Date(body.p),
    username: body.u
  };
  return result;
}

export interface AddUserToChatChannelMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  username: string;
}

export function AddUserToChatChannelMessageSerializer(request: AddUserToChatChannelMessage): any {
  return {
    i: request.channelId,
    u: request.username
  };
}

export interface UserAddedToChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  username: string;
  addedBy: string;
}

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

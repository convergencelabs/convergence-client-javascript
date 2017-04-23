import {IncomingProtocolNormalMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";

export interface JoinChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

export function JoinChatChannelRequestMessageSerializer(request: JoinChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

export interface UserJoinedChatChannelMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  username: string;
  timestamp: number;
}

export function UserJoinedRoomMessageDeserializer(body: any): UserJoinedChatChannelMessage {
  const result: UserJoinedChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    username: body.u,
    timestamp: body.p
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
  username: string;
  addedBy: string;
  timestamp: number;
}

export function UserAddedToChatChannelMessageDeserializer(body: any): UserAddedToChatChannelMessage {
  const result: UserAddedToChatChannelMessage = {
    channelId: body.i,
    eventNumber: body.n,
    addedBy: body.b,
    username: body.u,
    timestamp: body.p
  };
  return result;
}

export interface ChatChannelJoinedMessage extends IncomingProtocolNormalMessage {
  channelId: string;
}

export function ChatChannelJoinedMessageDeserializer(body: any): ChatChannelJoinedMessage {
  const result: ChatChannelJoinedMessage = {
    channelId: body.i
  };
  return result;
}

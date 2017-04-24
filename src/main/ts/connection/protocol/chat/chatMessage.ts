import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

export interface PublishChatMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  message: string;
}

export function PublishChatMessageSerializer(request: PublishChatMessage): any {
  return {
    i: request.channelId,
    m: request.message
  };
}

export interface RemoteChatMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  username: string;
  sessionId: string;
  timestamp: Date;
  message: string;
}

export function RemoteChatMessageDeserializer(body: any): RemoteChatMessage {
  const result: RemoteChatMessage = {
    channelId: body.i,
    eventNumber: body.e,
    message: body.m,
    username: body.u,
    sessionId: body.s,
    timestamp: new Date(body.p)
  };
  return result;
}

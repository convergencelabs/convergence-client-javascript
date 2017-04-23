import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";

export interface CreateChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId?: string;
  channelType: string;
  name?: string;
  topic?: string;
  privateChannel?: boolean;
  members?: string[];
}

export function CreateChatChannelRequestMessageSerializer(request: CreateChatChannelRequestMessage): any {
  return {
    i: request.channelId,
    e: request.channelType,
    n: request.name,
    c: request.topic,
    p: request.privateChannel,
    m: request.members
  };
}

export interface CreateChatChannelResponseMessage extends IncomingProtocolResponseMessage {
  channelId: string;
}

export function CreateChatChannelResponseMessageDeserializer(body: any): CreateChatChannelResponseMessage {
  const result: CreateChatChannelResponseMessage = {
    channelId: body.i
  };
  return result;
}

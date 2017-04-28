import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";

export interface CreateChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelType: string;
  membership: string;
  id?: string;
  name?: string;
  topic?: string;
  members?: string[];
}

export function CreateChatChannelRequestMessageSerializer(request: CreateChatChannelRequestMessage): any {
  return {
    i: request.id,
    e: request.channelType,
    p: request.membership,
    n: request.name,
    c: request.topic,
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

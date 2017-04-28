import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

export interface SetChatChannelNameMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  name: string;
}

export function SetChatChannelNameMessageSerializer(request: SetChatChannelNameMessage): any {
  return {
    i: request.channelId,
    n: request.name
  };
}

export interface ChatChannelNameSetMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  name: string;
  changedBy: string;
}

export function ChatChannelNameSetMessageDeserializer(body: any): ChatChannelNameSetMessage {
  const result: ChatChannelNameSetMessage = {
    channelId: body.i,
    eventNumber: body.e,
    timestamp: new Date(body.p),
    name: body.n,
    changedBy: body.b
  };
  return result;
}
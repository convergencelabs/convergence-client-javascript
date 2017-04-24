import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

export interface SetChatChannelTopicMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  topic: string;
}

export function SetChatChannelTopicMessageSerializer(request: SetChatChannelTopicMessage): any {
  return {
    i: request.channelId,
    c: request.topic,
  };
}

export interface ChatChannelTopicSetMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  topic: string;
  changedBy: string;
}

export function ChatChannelTopicSetMessageDeserializer(body: any): ChatChannelTopicSetMessage {
  const result: ChatChannelTopicSetMessage = {
    channelId: body.i,
    eventNumber: body.e,
    timestamp: new Date(body.p),
    topic: body.c,
    changedBy: body.b
  };
  return result;
}

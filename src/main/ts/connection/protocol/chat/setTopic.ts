import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface SetChatChannelTopicMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  topic: string;
}

/**
 * @hidden
 * @internal
 */
export function SetChatChannelTopicMessageSerializer(request: SetChatChannelTopicMessage): any {
  return {
    i: request.channelId,
    c: request.topic,
  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelTopicSetMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  topic: string;
  changedBy: string;
}

/**
 * @hidden
 * @internal
 */
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

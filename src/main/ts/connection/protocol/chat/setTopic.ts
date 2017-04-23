import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

export interface SetChatChannelTopicMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  topic: string;
}

export function SetChatChannelTopicMessageSerializer(request: SetChatChannelTopicMessage): any {
  return {
    i: request.channelId,
    t: request.topic
  };
}

export interface ChatChannelTopicSetMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  topic: string;
}

export function ChatChannelTopicSetMessageDeserializer(body: any): ChatChannelTopicSetMessage {
  const result: ChatChannelTopicSetMessage = {
    channelId: body.i,
    topic: body.t
  };
  return result;
}

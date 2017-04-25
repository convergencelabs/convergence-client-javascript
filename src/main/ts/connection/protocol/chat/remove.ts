import {OutgoingProtocolRequestMessage, IncomingProtocolNormalMessage} from "../protocol";

export interface RemoveChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

export function RemoveChatChannelRequestMessageSerializer(request: RemoveChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

export interface ChatChannelRemovedMessage extends IncomingProtocolNormalMessage {
  channelId: string;
}

export function ChatChannelRemovedMessageDeserializer(body: any): ChatChannelRemovedMessage {
  const result: ChatChannelRemovedMessage = {
    channelId: body.i
  };
  return result;
}


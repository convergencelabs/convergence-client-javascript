import {OutgoingProtocolRequestMessage, IncomingProtocolNormalMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface RemoveChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

/**
 * @hidden
 * @internal
 */
export function RemoveChatChannelRequestMessageSerializer(request: RemoveChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelRemovedMessage extends IncomingProtocolNormalMessage {
  channelId: string;
}

/**
 * @hidden
 * @internal
 */
export function ChatChannelRemovedMessageDeserializer(body: any): ChatChannelRemovedMessage {
  const result: ChatChannelRemovedMessage = {
    channelId: body.i
  };
  return result;
}

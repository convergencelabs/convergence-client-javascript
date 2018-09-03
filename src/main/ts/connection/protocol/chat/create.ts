import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface CreateChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelType: string;
  membership: string;
  id?: string;
  name?: string;
  topic?: string;
  members?: string[];
}

/**
 * @hidden
 * @internal
 */
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

/**
 * @hidden
 * @internal
 */
export interface CreateChatChannelResponseMessage extends IncomingProtocolResponseMessage {
  channelId: string;
}

/**
 * @hidden
 * @internal
 */
export function CreateChatChannelResponseMessageDeserializer(body: any): CreateChatChannelResponseMessage {
  const result: CreateChatChannelResponseMessage = {
    channelId: body.i
  };
  return result;
}

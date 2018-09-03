import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface SetChatChannelNameMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  name: string;
}

/**
 * @hidden
 * @internal
 */
export function SetChatChannelNameMessageSerializer(request: SetChatChannelNameMessage): any {
  return {
    i: request.channelId,
    n: request.name
  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelNameSetMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: number;
  timestamp: Date;
  name: string;
  changedBy: string;
}

/**
 * @hidden
 * @internal
 */
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

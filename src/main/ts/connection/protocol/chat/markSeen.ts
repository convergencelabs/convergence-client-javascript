import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

/**
 * @hidden
 * @internal
 */
export interface MarkChatChannelEventsSeenMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  eventNumber: number;
}

/**
 * @hidden
 * @internal
 */
export function MarkChatChannelEventsSeenMessageSerializer(request: MarkChatChannelEventsSeenMessage): any {
  return {
    i: request.channelId,
    e: request.eventNumber
  };
}

/**
 * @hidden
 * @internal
 */
export interface ChatChannelEventsMarkedSeenMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: string;
}

/**
 * @hidden
 * @internal
 */
export function ChatChannelEventsMarkedSeenMessageDeserializer(body: any): ChatChannelEventsMarkedSeenMessage {
  const result: ChatChannelEventsMarkedSeenMessage = {
    channelId: body.i,
    eventNumber: body.e
  };
  return result;
}

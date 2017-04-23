import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";

export interface MarkChatChannelEventsSeenMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
  eventNumber: number;
}

export function MarkChatChannelEventsSeenMessageSerializer(request: MarkChatChannelEventsSeenMessage): any {
  return {
    i: request.channelId,
    e: request.eventNumber
  };
}

export interface ChatChannelEventsMarkedSeenMessage extends IncomingProtocolNormalMessage {
  channelId: string;
  eventNumber: string;
}

export function ChatChannelEventsMarkedSeenMessageDeserializer(body: any): ChatChannelEventsMarkedSeenMessage {
  const result: ChatChannelEventsMarkedSeenMessage = {
    channelId: body.i,
    eventNumber: body.e
  };
  return result;
}

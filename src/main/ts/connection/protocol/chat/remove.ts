import {OutgoingProtocolRequestMessage} from "../protocol";

export interface RemoveChatChannelRequestMessage extends OutgoingProtocolRequestMessage {
  channelId: string;
}

export function RemoveChatChannelRequestMessageSerializer(request: RemoveChatChannelRequestMessage): any {
  return {
    i: request.channelId
  };
}

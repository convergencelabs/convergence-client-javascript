import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

export const CloseRealTimeModelRequestSerializer: MessageBodySerializer = (request: CloseRealTimeModelRequest) => {
  return {
    r: request.resourceId
  };
};

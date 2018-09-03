import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface CloseRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  resourceId: string;
}

/**
 * @hidden
 * @internal
 */
export const CloseRealTimeModelRequestSerializer: MessageBodySerializer = (request: CloseRealTimeModelRequest) => {
  return {
    r: request.resourceId
  };
};

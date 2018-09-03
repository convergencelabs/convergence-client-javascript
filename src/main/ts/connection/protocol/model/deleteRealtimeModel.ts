import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

/**
 * @hidden
 * @internal
 */
export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
}

/**
 * @hidden
 * @internal
 */
export const DeleteRealTimeModelRequestSerializer: MessageBodySerializer = (request: DeleteRealTimeModelRequest) => {
  return {
    m: request.modelId
  };
};

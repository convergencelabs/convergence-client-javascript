import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";

export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
}

export const DeleteRealTimeModelRequestSerializer: MessageBodySerializer = (request: DeleteRealTimeModelRequest) => {
  return {
    m: request.modelId
  };
};

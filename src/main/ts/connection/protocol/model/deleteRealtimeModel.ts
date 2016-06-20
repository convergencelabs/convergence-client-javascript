import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";

export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export var DeleteRealTimeModelRequestSerializer: MessageBodySerializer = (request: DeleteRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId
  };
};

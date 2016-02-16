import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";

export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  data: any;
}

export var CreateRealTimeModelRequestSerializer: MessageBodySerializer = (request: CreateRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    d: request.data
  };
};

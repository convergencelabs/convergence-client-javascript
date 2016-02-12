import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  data: any;
}

MessageSerializer.registerMessageBodySerializer(MessageType.CREATE_REAL_TIME_MODEL_REQUEST, (request: CreateRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    d: request.data
  };
});

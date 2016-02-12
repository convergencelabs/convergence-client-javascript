import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface DeleteRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

MessageSerializer.registerMessageBodySerializer(MessageType.DELETE_REAL_TIME_MODEL_REQUEST, (request: DeleteRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId
  };
});

MessageSerializer.registerDefaultMessageBodyDeserializer(MessageType.DELETE_REAL_TIME_MODEL_RESPONSE);

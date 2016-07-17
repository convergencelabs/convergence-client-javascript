import {OutgoingProtocolRequestMessage} from "../protocol";
import {ModelFqn} from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";
import {ObjectValue} from "../../../model/dataValue";
import {DataValueSerializer} from "./dataValue";

export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  data: ObjectValue;
}

export var CreateRealTimeModelRequestSerializer: MessageBodySerializer = (request: CreateRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    d: DataValueSerializer(request.data)
  };
};

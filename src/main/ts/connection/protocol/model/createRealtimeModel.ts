import {OutgoingProtocolRequestMessage, IncomingProtocolResponseMessage} from "../protocol";
import {ModelFqn} from "../../../model/ModelFqn";
import {MessageBodySerializer, MessageBodyDeserializer} from "../MessageSerializer";
import {ObjectValue} from "../../../model/dataValue";
import {DataValueSerializer} from "./dataValue";

export interface CreateRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  collectionId: string;
  modelId: string;
  data: ObjectValue;
}

export const CreateRealTimeModelRequestSerializer: MessageBodySerializer = (request: CreateRealTimeModelRequest) => {
  return {
    c: request.collectionId,
    m: request.modelId,
    d: DataValueSerializer(request.data)
  };
};

export interface CreateRealTimeModelResponse extends IncomingProtocolResponseMessage {
  collectionId: string;
  modelId: string;
}

export const CreateRealTimeModelResponseDeserializer: MessageBodyDeserializer<CreateRealTimeModelResponse> =
  (body: any) => {
    return {
      collectionId: body.c,
      modelId: body.m
    };
  };

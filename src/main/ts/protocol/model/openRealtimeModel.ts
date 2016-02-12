import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  initializerProvided: boolean;
}

MessageSerializer.registerMessageBodySerializer(MessageType.OPEN_REAL_TIME_MODEL_REQUEST, (request: OpenRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    i: request.initializerProvided
  };
});

export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.OPEN_REAL_TIME_MODEL_RESPONSE, (body: any) => {
  return {
    resourceId: body.r,
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: body.d
  };
});

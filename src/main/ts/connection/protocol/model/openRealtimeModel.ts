import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";

export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  initializerProvided: boolean;
}

export var OpenRealTimeModelRequestSerializer: MessageBodySerializer = (request: OpenRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    i: request.initializerProvided
  };
};

export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
}

export var OpenRealTimeModelResponseDeserializer: MessageBodyDeserializer<OpenRealTimeModelResponse> = (body: any) => {
  return {
    resourceId: body.r,
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: body.d
  };
};

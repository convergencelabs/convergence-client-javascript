import {IncomingProtocolRequestMessage} from "../protocol";
import {OutgoingProtocolResponseMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";
import {MessageSerializer} from "../MessageSerializer";

export interface ModelDataRequest extends IncomingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

MessageSerializer.registerMessageBodyDeserializer(MessageType.MODEL_DATA_REQUEST, (body: any) => {
  return {
    modelFqn: new ModelFqn(body.c, body.m)
  };
});


export interface ModelDataResponse extends OutgoingProtocolResponseMessage {
  data: any;
}

MessageSerializer.registerMessageBodySerializer(MessageType.MODEL_DATA_RESPONSE, (response: ModelDataResponse) => {
  return {
    d: response.data
  };
});

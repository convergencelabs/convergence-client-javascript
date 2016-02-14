import {IncomingProtocolRequestMessage} from "../protocol";
import {OutgoingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import ModelFqn from "../../model/ModelFqn";

export interface ModelDataRequest extends IncomingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export var ModelDataRequestDeserializer: MessageBodyDeserializer =  (body: any) => {
  return {
    modelFqn: new ModelFqn(body.c, body.m)
  };
};


export interface ModelDataResponse extends OutgoingProtocolResponseMessage {
  data: any;
}

export var ModelDataResponseSerializer: MessageBodySerializer = (response: ModelDataResponse) => {
  return {
    d: response.data
  };
};

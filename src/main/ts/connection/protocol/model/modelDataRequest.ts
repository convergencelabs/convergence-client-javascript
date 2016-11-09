import {IncomingProtocolRequestMessage} from "../protocol";
import {OutgoingProtocolResponseMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {ModelFqn} from "../../../model/ModelFqn";
import {DataValueSerializer} from "./dataValue";
import {ObjectValue} from "../../../model/dataValue";

export interface ModelDataRequest extends IncomingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export var ModelDataRequestDeserializer: MessageBodyDeserializer<ModelDataRequest> =  (body: any) => {
  return {
    modelFqn: new ModelFqn(body.c, body.m)
  };
};

export interface ModelDataResponse extends OutgoingProtocolResponseMessage {
  data: ObjectValue;
}

export var ModelDataResponseSerializer: MessageBodySerializer = (response: ModelDataResponse) => {
  return {
    d: DataValueSerializer(response.data)
  };
};

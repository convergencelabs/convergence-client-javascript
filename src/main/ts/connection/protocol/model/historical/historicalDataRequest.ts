import {ModelFqn} from "../../../../model/ModelFqn";
import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {DataValueDeserializer} from "../dataValue";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";

export interface HistoricalDataRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export var HistoricalDataRequestSerializer: MessageBodySerializer = (request: HistoricalDataRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
  };
};

export interface HistoricalDataResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  version: number;
  createdTime: Date;
  modifiedTime: Date;
  data: any;
}

export var HistoricalDataResponseDeserializer: MessageBodyDeserializer<HistoricalDataResponse> = (body: any) => {
  return {
    resourceId: body.r,
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: DataValueDeserializer(body.d.d)
  };
};

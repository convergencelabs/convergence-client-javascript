import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {DataValueDeserializer} from "../dataValue";
import {IncomingProtocolResponseMessage} from "../../protocol";

export interface HistoricalDataRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
}

export const HistoricalDataRequestSerializer: MessageBodySerializer = (request: HistoricalDataRequest) => {
  return {
    m: request.modelId,
  };
};

export interface HistoricalDataResponse extends IncomingProtocolResponseMessage {
  version: number;
  createdTime: Date;
  modifiedTime: Date;
  data: any;
  collectionId: string;
}

export function HistoricalDataResponseDeserializer(body: any) {
  return {
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: DataValueDeserializer(body.d),
    collectionId: body.i
  };
}

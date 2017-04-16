import {OutgoingProtocolRequestMessage} from "../../protocol";
import {DataValueDeserializer} from "../dataValue";
import {IncomingProtocolResponseMessage} from "../../protocol";

export interface HistoricalDataRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
}

export function HistoricalDataRequestSerializer(request: HistoricalDataRequest): any {
  return {
    m: request.modelId,
  };
}

export interface HistoricalDataResponse extends IncomingProtocolResponseMessage {
  version: number;
  createdTime: Date;
  modifiedTime: Date;
  data: any;
  collectionId: string;
}

export function HistoricalDataResponseDeserializer(body: any): HistoricalDataResponse {
  return {
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: DataValueDeserializer(body.d),
    collectionId: body.i
  };
}

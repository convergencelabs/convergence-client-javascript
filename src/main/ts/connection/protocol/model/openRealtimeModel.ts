import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {ReferenceTypeCodes} from "./reference/ReferenceEvent";
import {deserializeReferenceValue} from "./reference/ReferenceEvent";
import {DataValueDeserializer} from "./dataValue";

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
  connectedClients: string[];
  references: {[key: string]: ReferenceData[]};
}

export var OpenRealTimeModelResponseDeserializer: MessageBodyDeserializer<OpenRealTimeModelResponse> = (body: any) => {
  return {
    resourceId: body.r,
    version: body.v,
    createdTime: body.c,
    modifiedTime: body.m,
    data: DataValueDeserializer(body.d.d),
    connectedClients: body.d.s,
    references: convertReferences(body.d.r)
  };
};

export interface ReferenceData {
  sessionId: string;
  id: string;
  key: string;
  referenceType: string;
  value: any;
}

function convertReferences(refs: any[]): {[key: string]: ReferenceData[]} {
  "use strict";
  var result: {[key: string]: ReferenceData[]} = {};
  refs.forEach((ref: any) => {
    convertReferenceData(ref);
  });
  return result;
}

function convertReferenceData(ref: any): ReferenceData {
  "use strict";

  var type: string = ReferenceTypeCodes.value(ref.c);
  var value: any = deserializeReferenceValue(ref.v, type);
  var result: ReferenceData = {
    sessionId: ref.s,
    id: ref.d,
    key: ref.k,
    referenceType: type,
    value: value
  };
  return result;
}

import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import {ModelFqn} from "../../../model/ModelFqn";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {ReferenceTypeCodes} from "./reference/ReferenceEvent";
import {deserializeReferenceValues} from "./reference/ReferenceEvent";
import {DataValueDeserializer} from "./dataValue";
import {ModelPermissions} from "../../../model/ModelPermissions";
import {deserializeModelPermissions} from "./permissions/modelPermissions";

export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  initializerProvided: boolean;
}

export const OpenRealTimeModelRequestSerializer: MessageBodySerializer = (request: OpenRealTimeModelRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    i: request.initializerProvided
  };
};

export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  valueIdPrefix: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
  connectedClients: string[];
  references: ReferenceData[];
  permissions: ModelPermissions;
}

export const OpenRealTimeModelResponseDeserializer: MessageBodyDeserializer<OpenRealTimeModelResponse> =
  (body: any) => {
    return {
      resourceId: body.r,
      valueIdPrefix: body.p,
      version: body.v,
      createdTime: body.c,
      modifiedTime: body.m,
      data: DataValueDeserializer(body.d.d),
      connectedClients: body.d.s,
      references: convertReferences(body.d.r),
      permissions: deserializeModelPermissions(body.a)
    };
  };

export interface ReferenceData {
  sessionId: string;
  id: string;
  key: string;
  referenceType: string;
  values: any;
}

function convertReferences(refs: any[]): ReferenceData[] {
  "use strict";
  return refs.map((ref: any) => {
    return convertReferenceData(ref);
  });
}

function convertReferenceData(ref: any): ReferenceData {
  "use strict";

  const type: string = ReferenceTypeCodes.value(ref.c);
  const values: any = deserializeReferenceValues(ref.v, type);
  const result: ReferenceData = {
    sessionId: ref.s,
    id: ref.d,
    key: ref.k,
    referenceType: type,
    values
  };
  return result;
}

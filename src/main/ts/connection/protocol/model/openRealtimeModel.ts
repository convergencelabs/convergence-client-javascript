import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import {MessageBodySerializer} from "../MessageSerializer";
import {MessageBodyDeserializer} from "../MessageSerializer";
import {ReferenceTypeCodes} from "./reference/ReferenceEvent";
import {deserializeReferenceValues} from "./reference/ReferenceEvent";
import {DataValueDeserializer} from "./dataValue";
import {ModelPermissions} from "../../../model/ModelPermissions";
import {deserializeModelPermissions} from "./permissions/modelPermissions";

/**
 * @hidden
 * @internal
 */
export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  id?: string;
  autoCreateId?: number;
}

/**
 * @hidden
 * @internal
 */
export const OpenRealTimeModelRequestSerializer: MessageBodySerializer = (request: OpenRealTimeModelRequest) => {
  return {
    m: request.id,
    a: request.autoCreateId
  };
};

/**
 * @hidden
 * @internal
 */
export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  id: string;
  collection: string;
  valueIdPrefix: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
  connectedClients: string[];
  references: ReferenceData[];
  permissions: ModelPermissions;
}

/**
 * @hidden
 * @internal
 */
export const OpenRealTimeModelResponseDeserializer: MessageBodyDeserializer<OpenRealTimeModelResponse> =
  (body: any) => {
    return {
      resourceId: body.r,
      id: body.mi,
      collection: body.ci,
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

/**
 * @hidden
 * @internal
 */
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

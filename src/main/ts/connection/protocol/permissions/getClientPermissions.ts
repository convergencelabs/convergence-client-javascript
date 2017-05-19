import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetClientPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
}

export function GetClientPermissionsRequestSerializer(request: GetClientPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

export interface GetClientPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

export function GetClientPermissionsResponseDeserializer(body: any): GetClientPermissionsResponse {
  const result: GetClientPermissionsResponse = {
    permissions: body.p
  };
  return result;
}

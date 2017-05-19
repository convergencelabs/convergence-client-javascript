import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetGroupPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
  groupId: string;
}

export function GetGroupPermissionsRequestSerializer(request: GetGroupPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    u: request.groupId
  };
}

export interface GetGroupPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

export function GetGroupPermissionsResponseDeserializer(body: any): GetGroupPermissionsResponse {
  return {
    permissions: body.p
  };
}

import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetUserPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: any;
  username: string;
}

export function GetUserPermissionsRequestSerializer(request: GetUserPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    u: request.username
  };
}

export interface GetUserPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

export function GetUserPermissionsResponseDeserializer(body: any): GetUserPermissionsResponse {
  return {
    permissions: body.p
  };
}

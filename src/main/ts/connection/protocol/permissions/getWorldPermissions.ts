import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetWorldPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: any;
}

export function GetWorldPermissionsRequestSerializer(request: GetWorldPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

export interface GetWorldPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

export function GetWorldPermissionsResponseDeserializer(body: any): GetWorldPermissionsResponse {
  const result: GetWorldPermissionsResponse = {
    permissions: body.p
  };
  return result;
}

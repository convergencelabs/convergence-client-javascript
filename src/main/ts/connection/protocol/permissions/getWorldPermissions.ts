import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetWorldPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
}

/**
 * @hidden
 * @internal
 */
export function GetWorldPermissionsRequestSerializer(request: GetWorldPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetWorldPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

/**
 * @hidden
 * @internal
 */
export function GetWorldPermissionsResponseDeserializer(body: any): GetWorldPermissionsResponse {
  const result: GetWorldPermissionsResponse = {
    permissions: body.p
  };
  return result;
}

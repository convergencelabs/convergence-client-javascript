import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetUserPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
  username: string;
}

/**
 * @hidden
 * @internal
 */
export function GetUserPermissionsRequestSerializer(request: GetUserPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    u: request.username
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetUserPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

/**
 * @hidden
 * @internal
 */
export function GetUserPermissionsResponseDeserializer(body: any): GetUserPermissionsResponse {
  return {
    permissions: body.p
  };
}

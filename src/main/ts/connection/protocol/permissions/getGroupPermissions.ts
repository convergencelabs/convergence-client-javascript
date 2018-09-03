import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetGroupPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
  groupId: string;
}

/**
 * @hidden
 * @internal
 */
export function GetGroupPermissionsRequestSerializer(request: GetGroupPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    u: request.groupId
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetGroupPermissionsResponse extends IncomingProtocolNormalMessage {
  permissions: string[];
}

/**
 * @hidden
 * @internal
 */
export function GetGroupPermissionsResponseDeserializer(body: any): GetGroupPermissionsResponse {
  return {
    permissions: body.p
  };
}

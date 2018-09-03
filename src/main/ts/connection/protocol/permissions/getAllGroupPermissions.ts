import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetAllGroupPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
}

/**
 * @hidden
 * @internal
 */
export function GetAllGroupPermissionsRequestSerializer(request: GetAllGroupPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetAllGroupPermissionsResponse extends IncomingProtocolNormalMessage {
  groups: Map<string, string[]>;
}

/**
 * @hidden
 * @internal
 */
export function GetAllGroupPermissionsResponseDeserializer(body: any): GetAllGroupPermissionsResponse {
  const groups = new Map<string, string[]>();
  Object.keys(body.u).forEach(groupId => {
    groups.set(groupId, body.u[groupId]);
  });

  return {
    groups
  };
}

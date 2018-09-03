import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

/**
 * @hidden
 * @internal
 */
export interface GetAllUserPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
}

/**
 * @hidden
 * @internal
 */
export function GetAllUserPermissionsRequestSerializer(request: GetAllUserPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

/**
 * @hidden
 * @internal
 */
export interface GetAllUserPermissionsResponse extends IncomingProtocolNormalMessage {
  users: Map<string, string[]>;
}

/**
 * @hidden
 * @internal
 */
export function GetAllUserPermissionsResponseDeserializer(body: any): GetAllUserPermissionsResponse {
  const users = new Map<string, string[]>();
  Object.keys(body.u).forEach(userId => {
    users.set(userId, body.u[userId]);
  });

  return {
    users
  };
}

import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetAllUserPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: any;
}

export function GetAllUserPermissionsRequestSerializer(request: GetAllUserPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

export interface GetAllUserPermissionsResponse extends IncomingProtocolNormalMessage {
  users: Map<string, string[]>;
}

export function GetAllUserPermissionsResponseDeserializer(body: any): GetAllUserPermissionsResponse {
  let users = new Map<string, string[]>();
  Object.keys(body.u).forEach(userId => {
    users.set(userId, body.u[userId]);
  });

  return {
    users
  };
}

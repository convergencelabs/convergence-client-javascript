import {IncomingProtocolNormalMessage, OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface GetAllGroupPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: any;
}

export function GetAllGroupPermissionsRequestSerializer(request: GetAllGroupPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id
  };
}

export interface GetAllGroupPermissionsResponse extends IncomingProtocolNormalMessage {
  groups: Map<string, string[]>;
}

export function GetAllGroupPermissionsResponseDeserializer(body: any): GetAllGroupPermissionsResponse {
  let groups = new Map<string, string[]>();
  Object.keys(body.u).forEach(groupId => {
    groups.set(groupId, body.u[groupId]);
  });

  return {
    groups
  };
}

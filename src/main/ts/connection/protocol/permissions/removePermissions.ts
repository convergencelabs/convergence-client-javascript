import {OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface RemovePermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
  world?: string[];
  users?: Map<string, string[]>;
  groups?: Map<string, string[]>;
}

export function RemovePermissionsRequestSerializer(request: RemovePermissionsRequest): any {
  let users: {[key: string]: string[]};
  if (request.users) {
    users = {};
    request.users.forEach((v, k) => users[k] = v);
  }

  let groups: {[key: string]: string[]};
  if (request.groups) {
    groups = {};
    request.groups.forEach((v, k) => groups[k] = v);
  }
  return {
    p: request.idType,
    i: request.id,
    w: request.world,
    u: users,
    g: groups
  };
}

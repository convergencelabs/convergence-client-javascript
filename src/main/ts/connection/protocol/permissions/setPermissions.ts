import {OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface SetPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: string;
  world?: string[];
  users?: Map<string, string[]>;
  groups?: Map<string, string[]>;
}

export function SetPermissionsRequestSerializer(request: SetPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    w: request.world,
    u: request.users,
    g: request.groups
  };
}
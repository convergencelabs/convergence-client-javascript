import {OutgoingProtocolRequestMessage} from "../protocol";
import {IdType} from "./IdType";

export interface AddPermissionsRequest extends OutgoingProtocolRequestMessage {
  idType: IdType;
  id: any;
  world?: string[];
  users?: Map<string, string[]>;
  groups?: Map<string, string[]>;
}

export function AddPermissionsRequestSerializer(request: AddPermissionsRequest): any {
  return {
    p: request.idType,
    i: request.id,
    w: request.world,
    u: request.users,
    g: request.groups
  };
}

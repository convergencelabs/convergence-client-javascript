import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {ModelPermissions} from "../../../../model/ModelPermissions";
import {serializeModelPermissions} from "./modelPermissions";

export interface SetModelPermissionsRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
  overridesCollection?: boolean;
  world?: ModelPermissions;
  allUsers: boolean;
  users?: Map<string, ModelPermissions>;
}

export const SetModelPermissionsSerializer: MessageBodySerializer = (request: SetModelPermissionsRequest) => {
  let users: {[key: string]: any};
  if (request.users) {
    users = {};
    request.users.forEach((v, k) => users[k] = serializeModelPermissions(v));
  }
  return {
    m: request.modelId,
    s: request.overridesCollection,
    w: serializeModelPermissions(request.world),
    a: request.allUsers,
    u: users
  };
};

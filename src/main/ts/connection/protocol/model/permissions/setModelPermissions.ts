import {OutgoingProtocolRequestMessage} from "../../protocol";
import {ModelFqn} from "../../../../model/ModelFqn";
import {MessageBodySerializer} from "../../MessageSerializer";
import {ModelPermissions} from "../../../../model/ModelPermissions";
import {serializeModelPermissions} from "./modelPermissions";

export interface SetModelPermissionsRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
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
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId,
    s: request.overridesCollection,
    w: serializeModelPermissions(request.world),
    a: request.allUsers,
    u: users
  };
};

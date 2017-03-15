import {OutgoingProtocolRequestMessage} from "../../protocol";
import {ModelFqn} from "../../../../model/ModelFqn";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelPermissions} from "../../../../model/ModelPermissions";
import {ModelPermissionsImpl} from "../../../../model/ModelPermissionsImpl";

export interface SetModelPermissionsRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
  world?: ModelPermissions;
  allUsers?: boolean;
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
    w: serializeModelPermissions(request.world),
    a: request.allUsers,
    u: users
  };
};

function serializeModelPermissions(permissions: ModelPermissions): any {
  if (!permissions) {
    return null;
  }

  return {
    r: permissions.read,
    w: permissions.write,
    d: permissions.remove,
    m: permissions.manage
  };
}

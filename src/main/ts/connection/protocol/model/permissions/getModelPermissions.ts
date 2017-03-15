import {OutgoingProtocolRequestMessage} from "../../protocol";
import {ModelFqn} from "../../../../model/ModelFqn";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelPermissions} from "../../../../model/ModelPermissions";
import {deserializeModelPermissions} from "./modelPermissions";

export interface GetModelPermissionsRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export const GetModelUserPermissionsSerializer: MessageBodySerializer = (request: GetModelPermissionsRequest) => {
  return {
    c: request.modelFqn.collectionId,
    m: request.modelFqn.modelId
  };
};

export interface GetModelPermissionsResponse extends IncomingProtocolResponseMessage {
  world: ModelPermissions;
  users: Map<string, ModelPermissions>;
}

export const GetModelPermissionsResponseDeserializer: MessageBodyDeserializer<GetModelPermissionsResponse> =
  (body: any) => {

    const world = deserializeModelPermissions(body.w);

    let users = new Map<string, ModelPermissions>();
    if (body.u) {
      Object.keys(body.u).forEach(userId => {
        const permissions = deserializeModelPermissions(body.u[userId]);
        if (permissions === null) {
          throw new Error(`Invalid message, permissions for user ${userId} were null`);
        }
        users.set(userId, permissions);
      });
    }

    return {
      world,
      users
    };
  };



import {OutgoingProtocolRequestMessage} from "../../protocol";
import {MessageBodySerializer} from "../../MessageSerializer";
import {IncomingProtocolResponseMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {ModelPermissions} from "../../../../model/ModelPermissions";
import {deserializeModelPermissions} from "./modelPermissions";

/**
 * @hidden
 * @internal
 */
export interface GetModelPermissionsRequest extends OutgoingProtocolRequestMessage {
  modelId: string;
}

/**
 * @hidden
 * @internal
 */
export const GetModelPermissionsSerializer: MessageBodySerializer = (request: GetModelPermissionsRequest) => {
  return {
    m: request.modelId
  };
};

/**
 * @hidden
 * @internal
 */
export interface GetModelPermissionsResponse extends IncomingProtocolResponseMessage {
  overridesCollection: boolean;
  world: ModelPermissions;
  users: Map<string, ModelPermissions>;
}

/**
 * @hidden
 * @internal
 */
export const GetModelPermissionsResponseDeserializer: MessageBodyDeserializer<GetModelPermissionsResponse> =
  (body: any) => {

    const overridesCollection = body.o;
    const world = deserializeModelPermissions(body.w);

    const users = new Map<string, ModelPermissions>();
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
      overridesCollection,
      world,
      users
    };
  };

import {ModelPermissions} from "../../../../model/ModelPermissions";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {deserializeModelPermissions} from "./modelPermissions";

/**
 * @hidden
 * @internal
 */
export interface ModelPermissionsChanged extends IncomingProtocolNormalMessage {
  resourceId: string;
  permissions: ModelPermissions;
}

/**
 * @hidden
 * @internal
 */
export const ModelPermissionsChangedDeserializer: MessageBodyDeserializer<ModelPermissionsChanged> =  (body: any) => {
  return {
    resourceId: body.r,
    permissions: deserializeModelPermissions(body.p)
  };
};

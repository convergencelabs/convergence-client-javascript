import {ModelPermissions} from "../../../../model/ModelPermissions";
import {IncomingProtocolNormalMessage} from "../../protocol";
import {MessageBodyDeserializer} from "../../MessageSerializer";
import {deserializeModelPermissions} from "./modelPermissions";

export interface ModelPermissionsChanged extends IncomingProtocolNormalMessage {
  resourceId: string;
  permissions: ModelPermissions;
}

export const ModelPermissionsChangedDeserializer: MessageBodyDeserializer<ModelPermissionsChanged> =  (body: any) => {
  return {
    resourceId: body.r,
    permissions: deserializeModelPermissions(body.p)
  };
};

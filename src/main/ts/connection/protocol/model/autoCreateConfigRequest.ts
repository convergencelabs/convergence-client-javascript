import {IncomingProtocolRequestMessage} from "../protocol";
import {OutgoingProtocolResponseMessage} from "../protocol";
import {DataValueSerializer} from "./dataValue";
import {ObjectValue} from "../../../model/dataValue";
import {ModelPermissions} from "../../../model/ModelPermissions";
import {serializeModelPermissions} from "./permissions/modelPermissions";

/**
 * @hidden
 * @internal
 */
export interface AutoCreateModelConfigRequest extends IncomingProtocolRequestMessage {
  autoCreateId: number;
}

/**
 * @hidden
 * @internal
 */
export function AutoCreateModelConfigRequestDeserializer(body: any): AutoCreateModelConfigRequest  {
  return {
    autoCreateId: body.a
  };
}

/**
 * @hidden
 * @internal
 */
export interface AutoCreateModelConfigResponse extends OutgoingProtocolResponseMessage {
  collection: string;
  ephemeral?: boolean;
  data?: ObjectValue;
  overrideWorld?: boolean;
  worldPermissions?: ModelPermissions;
  userPermissions?: {[key: string]: ModelPermissions};
}

/**
 * @hidden
 * @internal
 */
export function AutoCreateModelConfigResponseSerializer(response: AutoCreateModelConfigResponse): any {
  const c = response.collection;
  const d: any = response.data ? DataValueSerializer(response.data) : undefined;
  const w = serializeModelPermissions(response.worldPermissions);
  const v = response.overrideWorld;
  let u: {[key: string]: any};
  if (response.userPermissions) {
    u = {};
    Object.keys(response.userPermissions).forEach(username => {
      u[username] = serializeModelPermissions(response.userPermissions[username]);
    });
  }
  const e = response.ephemeral;

  return { c, d, v, w, u, e };
}

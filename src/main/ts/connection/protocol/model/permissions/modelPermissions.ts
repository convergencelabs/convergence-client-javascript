import {ModelPermissionsImpl} from "../../../../model/ModelPermissionsImpl";
import {ModelPermissions} from "../../../../model/ModelPermissions";

export function deserializeModelPermissions(serialized: any): ModelPermissions {
  if (!serialized) {
    return null;
  }

  return new ModelPermissionsImpl(
    serialized.r,
    serialized.w,
    serialized.d,
    serialized.m);
}

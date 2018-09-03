import {ModelPermissionsImpl} from "../../../../model/ModelPermissionsImpl";
import {ModelPermissions} from "../../../../model/ModelPermissions";

/**
 * @hidden
 * @internal
 */
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

/**
 * @hidden
 * @internal
 */
export function serializeModelPermissions(permissions: ModelPermissions): any {
  if (permissions === null) {
    return null;
  }

  if (permissions === undefined) {
    return;
  }

  return {
    r: permissions.read,
    w: permissions.write,
    d: permissions.remove,
    m: permissions.manage
  };
}

import {ModelPermissions} from "./ModelPermissions";

export class ModelPermissionsImpl implements ModelPermissions {
  constructor(public readonly read: boolean,
              public readonly write: boolean,
              public readonly remove: boolean,
              public readonly manage: boolean) {
    Object.freeze(this);
  }
}

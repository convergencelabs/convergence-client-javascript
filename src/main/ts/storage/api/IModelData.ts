import {ObjectValue} from "../../model/dataValue";
import {ModelPermissions} from "../../model";

/**
 * @hidden
 * @internal
 */
export interface IModelData {
  id: string;
  collection: string;
  version: number;
  createdTime: Date;
  modifiedTime: Date;
  permissions: ModelPermissions;
  data: ObjectValue;
}

import {ObjectValue} from "../../model/dataValue";
import {ModelPermissions} from "../../model";

/**
 * @hidden
 * @internal
 */
export interface IModelData {
  modelId: string;
  local: boolean;
  collection: string;
  version: number;
  seqNo: number;
  createdTime: Date;
  modifiedTime: Date;
  permissions: ModelPermissions;
  data: ObjectValue;
}

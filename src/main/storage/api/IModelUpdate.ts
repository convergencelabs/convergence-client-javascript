/**
 * @hidden
 * @internal
 */
import {ModelPermissions} from "../../model";
import {ObjectValue} from "../../model/dataValue";

export interface IModelUpdate {
  modelId: string;
  dataUpdate?: IModelDataUpdate;
  permissionsUpdate?: ModelPermissions;
}

export interface IModelDataUpdate {
  data: ObjectValue;
  version: number;
  createdTime: Date;
  modifiedTime: Date;
}

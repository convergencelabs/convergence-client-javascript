import {ObjectValue} from "../../model/dataValue";

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
  data: ObjectValue;
}

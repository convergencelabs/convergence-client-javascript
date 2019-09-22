import {ObjectValue} from "../../model/dataValue";

export interface IModelData {
  id: string;
  collection: string;
  version: number;
  createdTime: Date;
  modifiedTime: Date;
  data: ObjectValue;
}

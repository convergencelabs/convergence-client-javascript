import {ObjectValue} from "../../model/dataValue";

export interface IModelData {
  id: string;
  collection: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: ObjectValue;
}

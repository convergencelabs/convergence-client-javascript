import {IModelData} from "./IModelData";
import {ILocalOperationData} from "./IModelOperationData";

export interface IModelState {
  model: IModelData;
  localOperations: ILocalOperationData[];
}

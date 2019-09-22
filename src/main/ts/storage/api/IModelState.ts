import {IModelData} from "./IModelData";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";

export interface IModelState {
  model: IModelData;
  serverOperations: IServerOperationData[];
  localOperations: ILocalOperationData[];
}

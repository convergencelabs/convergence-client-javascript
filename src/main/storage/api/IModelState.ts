import {IModelData} from "./IModelData";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";

/**
 * @hidden
 * @internal
 */
export interface IModelState {
  model: IModelData;
  serverOperations: IServerOperationData[];
  localOperations: ILocalOperationData[];
}

import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";

export interface IModelStore {
  putModel(model: IModelState): Promise<void>;

  getModel(modelId: string): Promise<IModelState>;

  deleteModel(modelId: string): Promise<void>;

  modelExists(modelId: string): Promise<boolean>;

  processServerOperation(serverOp: IServerOperationData): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;
}

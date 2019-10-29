import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";

/**
 * @hidden
 * @internal
 */
export interface IModelStore {
  getSubscribedModels(): Promise<string[]>;

  subscribeToModel(modelId: string): Promise<void>;

  setModelSubscriptions(modelIds: string[]): Promise<void>;

  unsubscribeFromModel(modelId: string): Promise<void>;

  putModel(model: IModelState): Promise<void>;

  getModel(modelId: string): Promise<IModelState | undefined>;

  modelExists(modelId: string): Promise<boolean>;

  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, sessionId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;
}

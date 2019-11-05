import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";
import {IModelCreationData} from "./IModelCreationData";
import {IOfflineModelSubscription} from "./IOfflineModelSubscription";

/**
 * @hidden
 * @internal
 */
export interface IModelStore {
  getSubscribedModels(): Promise<IOfflineModelSubscription[]>;

  addSubscription(modelIds: string[]): Promise<void>;

  removeSubscription(modelId: string[]): Promise<void>;

  setModelSubscriptions(modelIds: string[]): Promise<void>;

  createLocalModel(model: IModelCreationData): Promise<void>;

  getModelCreationData(modelId: string): Promise<IModelCreationData>;

  putModelState(model: IModelState): Promise<void>;

  getModel(modelId: string): Promise<IModelState | undefined>;

  modelExists(modelId: string): Promise<boolean>;

  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, sessionId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;

  modelCreated(modelId: string): Promise<void>;
}

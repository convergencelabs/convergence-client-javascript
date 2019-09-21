import {IModelStore} from "./IModelStore";

export interface IOfflineStorage {
  init(namespace: string, domainId: string): Promise<void>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  modelStore(): IModelStore;
}

import {IModelStore} from "./IModelStore";

export interface IStorageAdapter {
  init(namespace: string, domainId: string): Promise<void>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  modelStore(): IModelStore;
}

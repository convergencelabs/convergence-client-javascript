import {IModelStore} from "./IModelStore";
import {IMetaStore} from "./IMetaStore";

export interface IStorageAdapter {
  createStore(namespace: string, domainId: string, username: string): Promise<string>;

  openStore(namespace: string, domainId: string, storageKey: string): Promise<void>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  destroy(): void;

  modelStore(): IModelStore;

  metaStore(): IMetaStore;
}

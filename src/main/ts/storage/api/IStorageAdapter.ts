import {IModelStore} from "./IModelStore";
import {IMetaStore} from "./IMetaStore";

/**
 * @hidden
 * @internal
 */
export interface IStorageAdapter {
  openStore(namespace: string, domainId: string, username: string, storageKey?: string): Promise<string>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  destroy(): void;

  modelStore(): IModelStore;

  metaStore(): IMetaStore;
}

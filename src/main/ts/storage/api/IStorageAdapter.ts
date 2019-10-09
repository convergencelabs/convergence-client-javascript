import {IModelStore} from "./IModelStore";

/**
 * @hidden
 * @internal
 */
export interface IStorageAdapter {
  init(namespace: string, domainId: string): Promise<void>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  destroy(): void;

  modelStore(): IModelStore;
}

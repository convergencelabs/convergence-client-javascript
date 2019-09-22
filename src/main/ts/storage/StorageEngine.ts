import {IModelStore, IStorageAdapter} from "./api";

export class StorageEngine {
  private _storage: IStorageAdapter | null = null;

  public configure(storage: IStorageAdapter, namespace: string, domainId: string): Promise<void> {
    if (!storage) {
      throw new Error("storage must be specified");
    }

    if (!namespace) {
      throw new Error("namespace must be a non-empty string");
    }

    if (!domainId) {
      throw new Error("domain must be a non-empty string");
    }

    this._storage = storage;
    return this._storage.init(namespace, domainId);
  }

  public isEnabled(): boolean {
    return this._storage !== null;
  }

  public isInitialized(): boolean {
    return this._storage !== null && this._storage.isInitialized();
  }

  public dispose(): void {
    if (!this.isInitialized()) {
      throw new Error("Can not disposed a storage adapter that is not initialized");
    }

    if (this.isDisposed()) {
      throw new Error("Already disposed");
    }

    this._storage.dispose();
  }

  public isDisposed(): boolean {
    return this._storage !== null && this._storage.isDisposed();
  }

  public modelManager(): IModelStore {
    return this._storage.modelStore();
  }
}

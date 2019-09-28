import {IModelStore, IStorageAdapter} from "./api";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

export class StorageEngine {
  private static _log: Logger = Logging.logger("storage");
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

    StorageEngine._log.debug("Initializing storage");
    return storage
      .init(namespace, domainId)
      .then(() => {
        StorageEngine._log.debug("Storage initialized.");
        this._storage = storage;
      })
      .catch((e) => {
        StorageEngine._log.error("could not initialize storage adapter, storage disabled");
        return Promise.reject(e);
      });
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

  public modelStore(): IModelStore {
    return this._storage.modelStore();
  }
}

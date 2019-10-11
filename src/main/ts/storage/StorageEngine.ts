import {IModelStore, IStorageAdapter} from "./api";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export class StorageEngine {
  private static _log: Logger = Logging.logger("storage");
  private _storage: IStorageAdapter | null = null;
  private _storageKey: string | null;

  public configure(storage: IStorageAdapter): void {
    if (!storage) {
      throw new Error("storage must be specified");
    }

    this._storage = storage;
  }

  public createStore(namespace: string, domainId: string, username: string): Promise<void> {
    return this._storage.createStore(namespace, domainId, username)
      .then(key => {
        this._storageKey = key;
      });
  }

  public openStore(namespace: string, domainId: string, storageKey: string): Promise<void> {
    return this._storage.openStore(namespace, domainId, storageKey);
  }

  public storageKey(): string | null {
    return this._storageKey;
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

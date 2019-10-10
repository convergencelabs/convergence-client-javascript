import {IdbModelStore} from "./IdbModelStore";
import {toPromise} from "./promise";
import {IMetaStore, IStorageAdapter} from "../api/";
import {IdbSchemaManager} from "./IdbSchemaManager";
import {IdbMetaStore} from "./IdbMetaStore";

export class IdbStorageAdapter implements IStorageAdapter {
  private static readonly _DATABASE_NAME = "convergence.offline.storage";
  private static readonly _VERSION = 1;
  private _db: IDBDatabase | null = null;
  private _disposed: boolean = false;

  private _modelStore: IdbModelStore;
  private _metaStore: IMetaStore;

  public createStore(namespace: string, domainId: string, username: string): Promise<string> {
    // todo generate key
    return Promise.reject();
  }

  public openStore(namespace: string, domainId: string, storageKey: string): Promise<void> {
    return this._openDatabase(namespace, domainId, storageKey);
  }

  public isInitialized(): boolean {
    return this._db !== null;
  }

  public modelStore(): IdbModelStore {
    return this._modelStore;
  }

  public metaStore(): IMetaStore {
    return this._metaStore;
  }

  public destroy(): void {
    const name = this._db.name;
    this.dispose();
    indexedDB.deleteDatabase(name);
  }

  public dispose(): void {
    if (!this.isInitialized()) {
      throw new Error("Can not disposed a storage adapter that is not initialized");
    }

    if (this.isDisposed()) {
      throw new Error("Already disposed");
    }

    this._db.close();
    this._db = null;
    this._disposed = true;
  }

  public isDisposed(): boolean {
    return this._disposed;
  }

  private _openDatabase(namespace: string, domainId: string, key: string): Promise<void> {
    if (!namespace) {
      throw new Error("namespace must be a non-empty string");
    }

    if (!domainId) {
      throw new Error("domain must be a non-empty string");
    }

    if (!key) {
      throw new Error("key must be a non-empty string");
    }

    const dbName = `${IdbStorageAdapter._DATABASE_NAME}:${namespace}/${domainId}/${key}`;
    const openRequest = indexedDB.open(dbName, IdbStorageAdapter._VERSION);
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      const version = openRequest.result.version;
      IdbSchemaManager.upgrade(db, version);
    };

    return toPromise(openRequest).then((db: IDBDatabase) => {
      this._db = db;
      this._modelStore = new IdbModelStore(this._db);
      this._metaStore = new IdbMetaStore(this._db);
      return;
    });
  }
}

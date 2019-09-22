import {IdbModelStore} from "./IdbModelStore";
import {toPromise} from "./promise";
import {IModelStore, IStorageAdapter} from "../api/";
import {IdbSchemaManager} from "./IdbSchemaManager";

export class IdbStorageAdapter implements IStorageAdapter {
  private static readonly _DATABASE_NAME = "convergence.offline.storage";
  private static readonly _VERSION = 1;
  private _db: IDBDatabase | null = null;
  private _disposed: boolean = false;

  private _modelStore: IdbModelStore;

  public init(namespace: string, domainId: string): Promise<void> {
    if (!namespace) {
      throw new Error("namespace must be a non-empty string");
    }

    if (!domainId) {
      throw new Error("domain must be a non-empty string");
    }

    const dbName = `${IdbStorageAdapter._DATABASE_NAME}:${namespace}/${domainId}`;
    const openRequest = indexedDB.open(dbName, IdbStorageAdapter._VERSION);
    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      const version = openRequest.result.version;
      IdbSchemaManager.upgrade(db, version);
    };

    return toPromise(openRequest).then((db: IDBDatabase) => {
      this._db = db;
      this._modelStore = new IdbModelStore(this._db);
    });
  }

  public isInitialized(): boolean {
    return this._db !== null;
  }

  public modelStore(): IdbModelStore {
    return this._modelStore;
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
}

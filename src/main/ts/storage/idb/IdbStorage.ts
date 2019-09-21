import {IdbModelStore} from "./IdbModelStore";
import {toPromise} from "./promise";
import {IModelStore, IOfflineStorage} from "../api/";
import {IdbSchemaManager} from "./IdbSchemaManager";

export class IdbStorage implements IOfflineStorage {
  private static readonly _DATABASE_NAME = "convergence.offline.storage";
  private static readonly _VERSION = 1;
  private _db: IDBDatabase | null;
  private _disposed: boolean = false;

  private _modelStore: IdbModelStore;

  public init(namespace: string, domainId: string): Promise<void> {
    this._db = null;
    const dbName = `${IdbStorage._DATABASE_NAME}:${namespace}/${domainId}`;
    const openRequest = window.indexedDB.open(dbName, IdbStorage._VERSION);
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

  public modelStore(): IModelStore {
    return this._modelStore;
  }

  public dispose(): void {
    this._db.close();
    this._disposed = true;
  }

  public isDisposed(): boolean {
    return this._disposed;
  }
}

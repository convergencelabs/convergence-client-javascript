import {IModelStore, IOfflineStorage} from "./api";

export class StorageEngine {
  private _storage: IOfflineStorage | null = null;

  public configure(storage: IOfflineStorage, namespace: string, domainId: string): Promise<void> {
    if (!storage) {
      throw new Error("storage must be specified");
    }
    this._storage = storage;
    return this._storage.init(namespace, domainId);
  }

  public isEnabled(): boolean {
    return this._storage !== null;
  }

  public modelManager(): IModelStore {
    return this._storage.modelStore();
  }
}

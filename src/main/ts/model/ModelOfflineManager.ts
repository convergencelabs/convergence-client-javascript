import {RealTimeModel} from "./rt";
import {StorageEngine} from "../storage/StorageEngine";
import {IModelState} from "../storage/api/IModelState";
import {ILocalOperationData, IModelStore, IServerOperationData} from "../storage/api";

export class ModelOfflineManager {
  private readonly _subscribedModels: Set<string>;
  private readonly _openModels: Map<string, RealTimeModel>;
  private readonly _closedModels: Set<string>;
  private readonly _syncInterval: number;
  private readonly _storage: StorageEngine;

  constructor(syncInterval: number, snapshotInterval: number, storage: StorageEngine) {
    this._syncInterval = syncInterval;
    this._storage = storage;
    this._openModels = new Map();
    this._closedModels = new Set();
    this._subscribedModels = new Set();
  }

  public init(): Promise<void> {
    return this._storage.modelStore().getSubscribedModels().then(modelIds => {
      modelIds.forEach(modelId => {
        this._subscribedModels.add(modelId);
        this._closedModels.add(modelId);
      });

      return;
    });
  }

  public getOfflineModelIds(): string[] {
    return Array.from(this._subscribedModels.values());
  }

  public isOfflineEnabled(): boolean {
    return this._storage.isEnabled();
  }

  public setModelOffline(modelId: string, offline: boolean): Promise<void> {
    if (offline) {
      return this._storage
        .modelStore()
        .subscribeToModel(modelId)
        .then(() => {
          this._subscribedModels.delete(modelId);
        });
    } else {
      return this._storage
        .modelStore()
        .unsubscribeToModel(modelId)
        .then(() => {
          this._subscribedModels.add(modelId);
        });
    }
  }

  public modelStore(): IModelStore {
    return this._storage.modelStore();
  }

  public getOfflineModelData(modelId: string): Promise<IModelState | undefined> {
    return this._storage
      .modelStore()
      .getModel(modelId);
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore().processServerOperation(serverOp);
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    return this._storage.modelStore().processLocalOperation(localOp);
  }

  public processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore().processOperationAck(modelId, seqNo, serverOp);
  }

  public onModelOpen(model: RealTimeModel): void {
    this._openModels.set(model.modelId(), model);
    this._closedModels.delete(model.modelId());
    const currentState = model._getCurrentStateSnapshot();

    this._storage.modelStore().putModel(currentState).catch(e => {
      console.error(e);
    });

    model._setOfflineEnabled(true);
  }

  public onModelClosed(modelId: string): void {
    this._openModels.delete(modelId);
    this._closedModels.add(modelId);
  }

  public syncClosedModels(): void {
    this._closedModels.forEach(modelId => {
      console.log("Sync closed model: " + modelId);
    });
  }
}

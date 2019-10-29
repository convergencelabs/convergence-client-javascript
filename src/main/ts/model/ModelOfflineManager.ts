import {StorageEngine} from "../storage/StorageEngine";
import {IModelState} from "../storage/api/IModelState";
import {ILocalOperationData, IModelStore, IServerOperationData} from "../storage/api";
import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {ServerOperationEvent} from "./ot/ServerOperationEvent";
import {toOfflineOperationData} from "../storage/OfflineOperationMapper";
import {RealTimeModel} from "./rt";
import {IModelSnapshot} from "./IModelSnapshot";

/**
 * @hidden
 * @internal
 */
export class ModelOfflineManager {
  private readonly _subscribedModels: Set<string>;
  private readonly _openModels: Map<string, RealTimeModel>;
  private readonly _syncInterval: number;
  private readonly _storage: StorageEngine;

  constructor(syncInterval: number, snapshotInterval: number, storage: StorageEngine) {
    this._syncInterval = syncInterval;
    this._storage = storage;
    this._subscribedModels = new Set();
    this._openModels = new Map();
  }

  public init(): Promise<void> {
    return this._storage.modelStore().getSubscribedModels().then(modelIds => {
      modelIds.forEach(modelId => {
        this._subscribedModels.add(modelId);
      });

      return;
    });
  }

  public modelOpened(model: RealTimeModel): void {
    this._openModels.set(model.modelId(), model);
  }

  public modelClosed(model: RealTimeModel): void {
    this._openModels.delete(model.modelId());
  }

  public isModelSubscribed(modelId: string): boolean {
    return this._subscribedModels.has(modelId);
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
          this._subscribedModels.add(modelId);
          if (this._openModels.has(modelId)) {
            return this._initOpenModelForOffline(this._openModels.get(modelId));
          } else {
            return Promise.resolve();
          }
        });
    } else {
      return this._storage
        .modelStore()
        .unsubscribeFromModel(modelId)
        .then(() => {
          this._subscribedModels.delete(modelId);
          if (this._openModels.has(modelId)) {
            this._openModels.get(modelId)._disableOffline();
          }
        });
    }
  }

  public modelStore(): IModelStore {
    return this._storage.modelStore();
  }

  public createOfflineModel(model: IModelSnapshot): Promise<void> {
    const localOps = model.localOps.map(op => this._mapClientOperationEvent(model.snapshot.id, op));
    const state: IModelState = {
      model: model.snapshot,
      localOperations: localOps,
      serverOperations: []
    };
    return this._storage
      .modelStore()
      .putModel(state);
  }

  public getOfflineModelData(modelId: string): Promise<IModelState | undefined> {
    return this._storage
      .modelStore()
      .getModel(modelId);
  }

  public processLocalOperation(modelId: string, clientEvent: ClientOperationEvent): Promise<void> {
    const localOpData = this._mapClientOperationEvent(modelId, clientEvent);
    return this._storage.modelStore().processLocalOperation(localOpData);
  }

  public processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore().processOperationAck(modelId, seqNo, serverOp);
  }

  public processServerOperationEvent(modelId: string,
                                     serverOperation: ServerOperationEvent,
                                     transformedLocalOps: ClientOperationEvent[]): Promise<void> {
    const opData = toOfflineOperationData(serverOperation.operation);
    const serverOp: IServerOperationData = {
      modelId,
      sessionId: serverOperation.clientId,
      version: serverOperation.version,
      timestamp: serverOperation.timestamp,
      operation: opData
    };

    const currentLocalOps = transformedLocalOps
      .map(clientEvent => this._mapClientOperationEvent(modelId, clientEvent));

    return this._storage.modelStore().processServerOperation(serverOp, currentLocalOps);
  }

  private _initOpenModelForOffline(rtModel: RealTimeModel): Promise<void> {
    const offlineState = rtModel._enableOffline();
    const model = offlineState.snapshot;
    const localOperations = offlineState.localOps.map(op => this._mapClientOperationEvent(rtModel.modelId(), op));
    const serverOperations: IServerOperationData [] = [];
    return this._storage.modelStore().putModel({model, localOperations, serverOperations});
  }

  private _mapClientOperationEvent(modelId: string, opEvent: ClientOperationEvent): ILocalOperationData {
    const opData = toOfflineOperationData(opEvent.operation);
    return {
      sessionId: opEvent.sessionId,
      modelId,
      sequenceNumber: opEvent.seqNo,
      contextVersion: opEvent.contextVersion,
      timestamp: opEvent.timestamp,
      operation: opData
    };
  }
}

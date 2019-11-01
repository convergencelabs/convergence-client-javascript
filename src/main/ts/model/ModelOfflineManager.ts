import {StorageEngine} from "../storage/StorageEngine";
import {IModelState} from "../storage/api/IModelState";
import {ILocalOperationData, IServerOperationData} from "../storage/api";
import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {ServerOperationEvent} from "./ot/ServerOperationEvent";
import {toOfflineOperationData} from "../storage/OfflineOperationMapper";
import {RealTimeModel} from "./rt";
import {IModelCreationData} from "../storage/api/IModelCreationData";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export class ModelOfflineManager {
  private static readonly _log = Logging.logger("models.offline");

  private static _mapClientOperationEvent(modelId: string, opEvent: ClientOperationEvent): ILocalOperationData {
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

  public init(): void {
    this._storage.modelStore().getSubscribedModels().then(modelIds => {
      modelIds.forEach(modelId => {
        this._subscribedModels.add(modelId);
      });
    }).catch(e => {
      ModelOfflineManager._log.error("Error initializing offline model manager.", e);
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

  public subscribe(modelIds: string[]): void {

  }

  public unsubscribe(modelIds: string[]): void {

  }

  public setSubscriptions(modelIds: string[]): void {

  }

  public getModelCreationData(modelId: string): Promise<IModelCreationData> {
    return this._storage.modelStore().getModelCreationData(modelId);
  }

  public modelCreated(modelId: string): Promise<void> {
    return this._storage.modelStore().modelCreated(modelId);
  }

  public createOfflineModel(creationData: IModelCreationData): Promise<void> {
    return this._storage
      .modelStore()
      .createLocalModel(creationData);
  }

  public getOfflineModelData(modelId: string): Promise<IModelState | undefined> {
    return this._storage
      .modelStore()
      .getModel(modelId);
  }

  public processLocalOperation(modelId: string, clientEvent: ClientOperationEvent): Promise<void> {
    const localOpData = ModelOfflineManager._mapClientOperationEvent(modelId, clientEvent);
    return this._storage.modelStore().processLocalOperation(localOpData);
  }

  public processOperationAck(modelId: string,
                             sessionId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore().processOperationAck(modelId, sessionId, seqNo, serverOp);
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
      .map(clientEvent => ModelOfflineManager._mapClientOperationEvent(modelId, clientEvent));

    return this._storage.modelStore().processServerOperation(serverOp, currentLocalOps);
  }

  private _initOpenModelForOffline(rtModel: RealTimeModel): Promise<void> {
    const offlineState = rtModel._enableOffline();
    const model = offlineState.model;
    const localOperations = offlineState.localOps
      .map(op => ModelOfflineManager._mapClientOperationEvent(rtModel.modelId(), op));
    const serverOperations: IServerOperationData [] = [];
    return this._storage.modelStore().putModelState({model, localOperations, serverOperations});
  }
}

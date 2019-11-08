import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {ILocalOperationData, IModelData, IModelStore, IServerOperationData} from "../api/";
import {toPromise, toVoidPromise} from "./promise";
import {IdbSchema} from "./IdbSchema";
import {IModelState} from "../api/IModelState";
import {IModelCreationData} from "../api/IModelCreationData";
import {ModelPermissions} from "../../model";
import {IOfflineModelSubscription} from "../api/IOfflineModelSubscription";

/**
 * @hidden
 * @internal
 */
export class IdbModelStore extends IdbPersistenceStore implements IModelStore {
  private static deleteServerOperationsForModel(store: IDBObjectStore, modelId: string): void {
    IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelServerOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static deleteLocalOperationsForModel(store: IDBObjectStore, modelId: string): void {
    IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelLocalOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static putLocalOperationsForModel(store: IDBObjectStore, operations: ILocalOperationData[]): void {
    operations.forEach(op => store.add(op));
  }

  private static putServerOperationsForModel(store: IDBObjectStore, operations: IServerOperationData[]): void {
    operations.forEach(op => store.add(op));
  }

  private static _putModelState(
    modelState: IModelState,
    modelStore: IDBObjectStore,
    localOpStore: IDBObjectStore,
    serverOpStore: IDBObjectStore): void {
    const {model, localOperations, serverOperations} = modelState;
    modelStore.put(model);
    IdbModelStore.deleteServerOperationsForModel(serverOpStore, model.modelId);
    IdbModelStore.deleteLocalOperationsForModel(localOpStore, model.modelId);
    IdbModelStore.putLocalOperationsForModel(localOpStore, localOperations);
    IdbModelStore.putServerOperationsForModel(serverOpStore, serverOperations);
  }

  public createLocalModel(modelCreation: IModelCreationData): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store];

    return this._withWriteStores(stores, async ([creationStore, modelStore, localOpStore, serverOpStore]) => {
      creationStore.put(modelCreation);

      const version = 0;
      const seqNo = 0;
      const now = new Date();
      const permissions = new ModelPermissions(true, true, true, true);
      const modelState: IModelState = {
        model: {
          modelId: modelCreation.modelId,
          local: true,
          collection: modelCreation.collection,
          version,
          seqNo,
          createdTime: now,
          modifiedTime: now,
          permissions,
          data: modelCreation.initialData
        },
        localOperations: [],
        serverOperations: []
      };

      IdbModelStore._putModelState(modelState, modelStore, localOpStore, serverOpStore);
    });
  }

  public modelCreated(modelId: string): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelData.Store];

    return this._withWriteStores(stores, async ([creationStore, snapshotStore]) => {
      creationStore.delete(modelId);
      const model: IModelData = await toPromise(snapshotStore.get(modelId));
      model.local = false;
      return toVoidPromise(snapshotStore.put(model));
    });
  }

  public getModelCreationData(modelId: string): Promise<IModelCreationData> {
    return this._withReadStore(IdbSchema.ModelCreation.Store, async store => {
      return toPromise(store.get(modelId));
    });
  }

  public putModelState(modelState: IModelState): Promise<void> {
    const stores = [
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      IdbModelStore._putModelState(modelState, modelStore, localOpStore, serverOpStore);
    });
  }

  public modelExists(modelId: string): Promise<boolean> {
    if (modelId === undefined || modelId === null) {
      throw new Error("modelId must be defined");
    }

    return this._withReadStore(IdbSchema.ModelData.Store, (store) => {
      const idx = store.index(IdbSchema.ModelData.Indices.ModelId);
      return toPromise(idx.count(modelId)).then((count => count > 0));
    });
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    return this.add(IdbSchema.ModelServerOperation.Store, serverOp);
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    return this.add(IdbSchema.ModelLocalOperation.Store, localOp);
  }

  public processOperationAck(modelId: string,
                             sessionId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    const stores = [IdbSchema.ModelLocalOperation.Store, IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([localOpStore, serverOpStore]) => {
      localOpStore.delete([modelId, sessionId, seqNo]);
      serverOpStore.add(serverOp);
    });
  }

  public getModel(modelId: string): Promise<IModelState | undefined> {
    if (modelId === undefined || modelId === null) {
      throw new Error("modelId must be defined");
    }

    const stores = [
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store];
    return this._withReadStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      const model = await toPromise(modelStore.get(modelId));
      if (model) {
        const localOpsIndex = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
        const localOperations = await toPromise(localOpsIndex.getAll(modelId));

        const serverOpsIndex = serverOpStore.index(IdbSchema.ModelServerOperation.Indices.ModelId);
        const serverOperations = await toPromise(serverOpsIndex.getAll(modelId));

        return {model, localOperations, serverOperations} as IModelState;
      } else {
        return;
      }
    });
  }

  public setModelSubscriptions(subscriptions: IOfflineModelSubscription[]): Promise<void> {
    const storeName = IdbSchema.ModelSubscriptions.Store;
    return this._withWriteStore(storeName, async (store) => {
      return toPromise(store.clear()).then(() => {
        subscriptions.forEach(subscription => {
          store.put(subscription);
        });
      });
    });
  }

  public getSubscribedModels(): Promise<IOfflineModelSubscription[]> {
    const storeName = IdbSchema.ModelSubscriptions.Store;
    return this._withReadStore(storeName, async (store) => {
      return toPromise(store.getAll());
    });
  }

  public addSubscription(modelIds: string[]): Promise<void> {
    const storeName = IdbSchema.ModelSubscriptions.Store;
    return this._withWriteStore(storeName, async (store) => {
      modelIds.forEach(modelId => {
        const data: IOfflineModelSubscription = {modelId, version: 0};
        store.put(data);
      });
    });
  }

  public removeSubscription(modelIds: string[]): Promise<void> {
    const stores = [
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store,
      IdbSchema.ModelSubscriptions.Store
    ];

    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore, subStore]) => {
      modelIds.forEach(modelId => {
        modelStore.delete(modelId);
        IdbModelStore.deleteServerOperationsForModel(serverOpStore, modelId);
        IdbModelStore.deleteLocalOperationsForModel(localOpStore, modelId);
        subStore.delete(modelId);
      });
    });
  }

  public deleteModel(modelId: string): Promise<void> {
    const stores = [IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store];
    return this._withWriteStores(stores, async ([modelStore, localOpStore, serverOpStore]) => {
      modelStore.delete(modelId);
      IdbModelStore.deleteServerOperationsForModel(serverOpStore, modelId);
      IdbModelStore.deleteLocalOperationsForModel(localOpStore, modelId);
    });
  }
}

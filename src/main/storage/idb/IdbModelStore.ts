/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IdbPersistenceStore} from "./IdbPersistenceStore";
import {
  ILocalOperationData,
  IModelCreationData,
  IModelData,
  IModelMetaData,
  IModelSnapshot,
  IModelState,
  IModelStore,
  IModelUpdate,
  IServerOperationData
} from "../api";
import {toPromise, toVoidPromise} from "./promise";
import {IdbSchema} from "./IdbSchema";
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

  private static _toDataAndMetaData(snapshot: IModelSnapshot): { data: IModelData, meta: IModelMetaData } {
    const data: IModelData = {
      modelId: snapshot.modelId,
      data: snapshot.data
    };

    const meta: IModelMetaData = {
      modelId: snapshot.modelId,
      collection: snapshot.collection,
      local: snapshot.local,
      dirty: snapshot.local,
      createdTime: snapshot.createdTime,
      modifiedTime: snapshot.modifiedTime,
      permissions: snapshot.permissions,
      seqNo: snapshot.seqNo,
      version: snapshot.version
    };

    return {data, meta};
  }

  private static _putModelState(
    modelState: IModelState,
    modelMetaDataStore: IDBObjectStore,
    modelDataStore: IDBObjectStore,
    localOpStore: IDBObjectStore,
    serverOpStore: IDBObjectStore): void {
    const {snapshot, localOperations, serverOperations} = modelState;

    const {data, meta} = IdbModelStore._toDataAndMetaData(snapshot);
    modelDataStore.put(data);
    modelMetaDataStore.put(meta);

    IdbModelStore.deleteServerOperationsForModel(serverOpStore, meta.modelId);
    IdbModelStore.deleteLocalOperationsForModel(localOpStore, meta.modelId);
    IdbModelStore.putLocalOperationsForModel(localOpStore, localOperations);
    IdbModelStore.putServerOperationsForModel(serverOpStore, serverOperations);
  }

  public createLocalModel(modelCreation: IModelCreationData): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store
    ];

    return this._withWriteStores(stores, async ([
                                                  creationStore,
                                                  modelMetaDataStore,
                                                  modelDataStore,
                                                  localOpStore,
                                                  serverOpStore]) => {
      creationStore.put(modelCreation);

      const version = 0;
      const seqNo = 0;
      const now = new Date();
      const permissions = new ModelPermissions(true, true, true, true);
      const modelState: IModelState = {
        snapshot: {
          modelId: modelCreation.modelId,
          local: true,
          dirty: true,
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

      IdbModelStore._putModelState(modelState, modelMetaDataStore, modelDataStore, localOpStore, serverOpStore);
    });
  }

  public modelCreated(modelId: string): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store
    ];

    return this._withWriteStores(stores, async ([creationStore, modelMetaDataStore]) => {
      creationStore.delete(modelId);
      const metaData: IModelMetaData = await toPromise(modelMetaDataStore.get(modelId));
      metaData.local = false;
      metaData.dirty = false;
      return toVoidPromise(modelMetaDataStore.put(metaData));
    });
  }

  public getModelCreationData(modelId: string): Promise<IModelCreationData> {
    return this._withReadStore(IdbSchema.ModelCreation.Store, async store => {
      return toPromise(store.get(modelId));
    });
  }

  public putModelState(modelState: IModelState): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withWriteStores(stores, async ([modelMetaData, modelDataStore, localOpStore, serverOpStore]) => {
      IdbModelStore._putModelState(modelState, modelMetaData, modelDataStore, localOpStore, serverOpStore);
    });
  }

  public updateOfflineModel(update: IModelUpdate): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelSubscriptions.Store
    ];
    return this._withWriteStores(stores, async ([modelMetaDataStore, modelDataStore, subscriptionStore]) => {
      const {modelId, dataUpdate, permissionsUpdate} = update;
      const modelMetaData: IModelMetaData = await toPromise(modelMetaDataStore.get(modelId));

      // TODO we should check to see if the model is locally modified.

      if (dataUpdate) {
        modelMetaData.version = dataUpdate.version;
        modelMetaData.createdTime = dataUpdate.createdTime;
        modelMetaData.modifiedTime = dataUpdate.modifiedTime;

        const data: IModelData = {
          modelId,
          data: dataUpdate.data
        };
        await toVoidPromise(modelDataStore.put(data));

        // Update the subscription table to indicate we have a new version.
        await toVoidPromise(subscriptionStore.put({modelId, version: modelMetaData.version}));
      }

      if (permissionsUpdate) {
        modelMetaData.permissions = permissionsUpdate;
      }

      return toVoidPromise(modelMetaDataStore.put(modelMetaData));
    });
  }

  public modelExists(modelId: string): Promise<boolean> {
    if (modelId === undefined || modelId === null) {
      throw new Error("modelId must be defined");
    }

    return this._withReadStore(IdbSchema.ModelMetaData.Store, (store) => {
      const idx = store.index(IdbSchema.ModelMetaData.Indices.ModelId);
      return toPromise(idx.count(modelId)).then((count => count > 0));
    });
  }

  public async getDirtyModelIds(): Promise<string[]> {
    const ids: string[] = [];
    await this._readIterator(IdbSchema.ModelMetaData.Store,
      (value: IModelMetaData) => {
        if (value.dirty) {
          ids.push(value.modelId);
        }
      });

    return ids;
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    const stores = [
      IdbSchema.ModelServerOperation.Store,
      IdbSchema.ModelSubscriptions.Store
    ];

    return this._withWriteStores(stores, async ([serverOpStore, subscriptionsStore]) => {
      serverOpStore.add(serverOp);
      subscriptionsStore.put({modelId: serverOp.modelId, version: serverOp.version});
    });
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    return this.add(IdbSchema.ModelLocalOperation.Store, localOp);
  }

  public processOperationAck(modelId: string,
                             sessionId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    const stores = [
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store,
      IdbSchema.ModelSubscriptions.Store
    ];

    return this._withWriteStores(stores, async ([localOpStore, serverOpStore, subscriptionsStore]) => {
      localOpStore.delete([modelId, sessionId, seqNo]);
      serverOpStore.add(serverOp);
      subscriptionsStore.put({modelId, version: serverOp.version});
    });
  }

  public getModelState(modelId: string): Promise<IModelState | undefined> {
    if (modelId === undefined || modelId === null) {
      throw new Error("modelId must be defined");
    }

    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withReadStores(stores,
      async ([modelMetaDataStore, modelDataStore, localOpStore, serverOpStore]) => {
        const meta: IModelMetaData = await toPromise(modelMetaDataStore.get(modelId));
        const data: IModelData = await toPromise(modelDataStore.get(modelId));
        if (meta && data) {
          const localOpsIndex = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
          const localOperations = await toPromise(localOpsIndex.getAll(modelId));

          const serverOpsIndex = serverOpStore.index(IdbSchema.ModelServerOperation.Indices.ModelId);
          const serverOperations = await toPromise(serverOpsIndex.getAll(modelId));
          const snapshot: IModelSnapshot = {
            modelId: meta.modelId,
            collection: meta.collection,
            local: meta.local,
            dirty: meta.dirty,
            version: meta.version,
            seqNo: meta.seqNo,
            createdTime: meta.createdTime,
            modifiedTime: meta.modifiedTime,
            permissions: meta.permissions,
            data: data.data
          };

          return {snapshot, localOperations, serverOperations} as IModelState;
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
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store,
      IdbSchema.ModelSubscriptions.Store
    ];

    return this._withWriteStores(stores,
      async ([modelMetaDataStore, modelDataStore, localOpStore, serverOpStore, subStore]) => {
        modelIds.forEach(modelId => {
          modelMetaDataStore.delete(modelId);
          modelDataStore.delete(modelId);
          IdbModelStore.deleteServerOperationsForModel(serverOpStore, modelId);
          IdbModelStore.deleteLocalOperationsForModel(localOpStore, modelId);
          subStore.delete(modelId);
        });
      });
  }

  public snapshotModel(snapshot: IModelSnapshot): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withWriteStores(stores,
      async ([modelMetaDataStore, modelDataStore, serverOpStore]) => {
        const {data, meta} = IdbModelStore._toDataAndMetaData(snapshot);
        modelMetaDataStore.put(meta);
        modelDataStore.put(data);
        IdbModelStore.deleteServerOperationsForModel(serverOpStore, meta.modelId);
      });
  }
}

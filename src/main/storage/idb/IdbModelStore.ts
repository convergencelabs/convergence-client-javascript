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
import {ModelPermissions, IObjectValue} from "../../model";
import {IModelMetaDataDocument} from "../api/IModelMetaDataDocument";
import {ConvergenceError} from "../../util";
import {TypeChecker} from "../../util/TypeChecker";

/**
 * @hidden
 * @internal
 */
export class IdbModelStore extends IdbPersistenceStore implements IModelStore {
  private static _deleteServerOperationsForModel(store: IDBObjectStore, modelId: string): Promise<void> {
    return IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelServerOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static _deleteLocalOperationsForModel(store: IDBObjectStore, modelId: string): Promise<void> {
    return IdbPersistenceStore.deleteFromIndex(store,
      IdbSchema.ModelLocalOperation.Indices.ModelId,
      IDBKeyRange.only(modelId));
  }

  private static async _putLocalOperationsForModel(store: IDBObjectStore,
                                                   operations: ILocalOperationData[]): Promise<void> {
    for (const op of operations) {
      await toVoidPromise(store.add(op));
    }
  }

  private static async _putServerOperationsForModel(store: IDBObjectStore,
                                                    operations: IServerOperationData[]): Promise<void> {
    for (const op of operations) {
      await toVoidPromise(store.add(op));
    }
  }

  private static _metaDataDocToMetaData(doc: IModelMetaDataDocument): IModelMetaData {
    const metaData: IModelMetaData = {
      modelId: doc.modelId,

      subscribed: doc.subscribed === 1,
      available: doc.available === 1,
      deleted: doc.deleted === 1,
      created: doc.created === 1,
      uncommitted: doc.uncommitted === 1,
      syncRequired: doc.syncRequired === 1,
    };

    if (doc.details) {
      metaData.details = {
        collection: doc.details.collection,
        valueIdPrefix: doc.details.valueIdPrefix,
        version: doc.details.version,
        lastSequenceNumber: doc.details.lastSequenceNumber,
        createdTime: doc.details.createdTime,
        modifiedTime: doc.details.modifiedTime,
        permissions: new ModelPermissions(
          doc.details.permissions.read,
          doc.details.permissions.write,
          doc.details.permissions.remove,
          doc.details.permissions.manage,
        ),
        snapshotVersion: doc.details.snapshotVersion,
        snapshotSequenceNumber: doc.details.snapshotSequenceNumber
      };
    }

    return metaData;
  }

  private static async _putModelState(
    modelState: IModelState,
    modelMetaDataStore: IDBObjectStore,
    modelDataStore: IDBObjectStore,
    localOpStore: IDBObjectStore,
    serverOpStore: IDBObjectStore): Promise<void> {

    const currentMetaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelState.modelId));

    const valueIdPrefix = {
      prefix: modelState.valueIdPrefix.prefix,
      increment: modelState.valueIdPrefix.increment || 0
    };

    const meta: IModelMetaDataDocument = {
      modelId: modelState.modelId,

      available: 1,

      details: {
        collection: modelState.collection,
        valueIdPrefix,
        createdTime: modelState.createdTime,
        modifiedTime: modelState.modifiedTime,
        permissions: {
          read: modelState.permissions.read,
          write: modelState.permissions.write,
          remove: modelState.permissions.remove,
          manage: modelState.permissions.manage,
        },
        lastSequenceNumber: modelState.lastSequenceNumber,
        version: modelState.version,
        snapshotVersion: modelState.snapshot.version,
        snapshotSequenceNumber: modelState.snapshot.sequenceNumber
      }
    };

    if (modelState.local) {
      meta.created = 1;
    }

    meta.available = 1;

    if (currentMetaData) {
      meta.subscribed = currentMetaData.subscribed;
      meta.deleted = currentMetaData.deleted;
    }

    IdbModelStore._setSyncRequired(meta);

    await toVoidPromise(modelMetaDataStore.put(meta));

    const data: IModelData = {
      modelId: modelState.modelId,
      data: modelState.snapshot.data,
    };
    await toVoidPromise(modelDataStore.put(data));

    await IdbModelStore._deleteServerOperationsForModel(serverOpStore, meta.modelId);
    await IdbModelStore._deleteLocalOperationsForModel(localOpStore, meta.modelId);
    await IdbModelStore._putLocalOperationsForModel(localOpStore, modelState.snapshot.localOperations);
    await IdbModelStore._putServerOperationsForModel(serverOpStore, modelState.snapshot.serverOperations);
  }

  private static async _removeSubscriptions(
    modelIds: string[],
    createStore: IDBObjectStore,
    modelMetaDataStore: IDBObjectStore,
    modelDataStore: IDBObjectStore,
    localOpStore: IDBObjectStore,
    serverOpStore: IDBObjectStore): Promise<void> {

    for (const modelId of modelIds) {
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));
      if (!metaData) {
        continue;
      }

      delete metaData.subscribed;

      IdbModelStore._setSyncRequired(metaData);

      // If we don't have changes to go up to the server we can remove.
      if (!IdbModelStore._isMetaDataNeeded(metaData)) {
        await this._deleteModel(modelId, createStore, modelMetaDataStore, modelDataStore, localOpStore, serverOpStore);
      } else {
        await modelMetaDataStore.put(metaData);
      }
    }
  }

  private static async _deleteModel(
    modelId: string,
    modelCreateStore: IDBObjectStore,
    modelMetaDataStore: IDBObjectStore,
    modelDataStore: IDBObjectStore,
    localOpStore: IDBObjectStore,
    serverOpStore: IDBObjectStore): Promise<void> {

    await modelCreateStore.delete(modelId);
    await modelMetaDataStore.delete(modelId);
    await modelDataStore.delete(modelId);
    await IdbModelStore._deleteServerOperationsForModel(serverOpStore, modelId);
    await IdbModelStore._deleteLocalOperationsForModel(localOpStore, modelId);
  }

  private static async _addSubscriptions(modelIds: string[], metaDataStore: IDBObjectStore): Promise<void> {
    for (const modelId of modelIds) {
      const current = await toPromise<IModelMetaDataDocument>(metaDataStore.get(modelId));
      let updated: IModelMetaDataDocument;
      if (current !== undefined) {
        updated = current;
        updated.subscribed = 1;
      } else {
        updated = {
          modelId,
          subscribed: 1,
        };
      }

      await toVoidPromise(metaDataStore.put(updated));
    }
  }

  private static _setSyncRequired(meta: IModelMetaDataDocument): void {
    if (meta.deleted === 1 || meta.created === 1 || meta.uncommitted === 1) {
      meta.syncRequired = 1;
    } else {
      delete meta.syncRequired;
    }
  }

  private static _isMetaDataNeeded(meta: IModelMetaDataDocument): boolean {
    return meta.subscribed === 1 || meta.syncRequired === 1;
  }

  public createModelOffline(modelCreation: IModelCreationData): Promise<void> {
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
      const modelId = modelCreation.modelId;

      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));
      if (TypeChecker.isSet(metaData) && metaData.available) {
        return Promise.reject(new Error(`An offline model with the specified id already exists: ${modelId}`));
      }

      await toVoidPromise(creationStore.put(modelCreation));

      const version = 1;
      const lastSequenceNumber = 0;
      const now = new Date();
      const permissions = new ModelPermissions(true, true, true, true);
      const modelState: IModelState = {
        modelId,
        collection: modelCreation.collection,

        valueIdPrefix: {prefix: "0", increment: 0},

        version,
        lastSequenceNumber,
        createdTime: now,
        modifiedTime: now,

        permissions,

        local: true,
        snapshot: {
          version,
          sequenceNumber: lastSequenceNumber,
          data: modelCreation.initialData,
          localOperations: [],
          serverOperations: []
        },
      };

      await IdbModelStore._putModelState(modelState, modelMetaDataStore, modelDataStore, localOpStore, serverOpStore);
    });
  }

  public deleteModel(modelId: string): Promise<void> {
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
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));

      if (!metaData) {
        throw new Error(`Can't delete model '${modelId}' because it doesn't exist.`);
      }

      delete metaData.details;
      delete metaData.subscribed;
      delete metaData.available;
      delete metaData.uncommitted;

      if (metaData.created === 1) {
        // If it was created locally, we are now going to remove it,
        // and we don't need to delete it locally.
        delete metaData.created;
      } else {
        // we need to mark it for deletion.
        metaData.deleted = 1;
      }

      IdbModelStore._setSyncRequired(metaData);

      await toVoidPromise(modelMetaDataStore.put(metaData));

      await toVoidPromise(creationStore.delete(modelId));
      await IdbModelStore._deleteLocalOperationsForModel(localOpStore, modelId);
      await IdbModelStore._deleteServerOperationsForModel(serverOpStore, modelId);
      await toVoidPromise(modelDataStore.delete(modelId));
    });
  }

  public modelDeleted(modelId: string): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store
    ];

    return this._withWriteStores(stores, async ([modelMetaDataStore]) => {
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));
      if (metaData) {
        delete metaData.deleted;
        IdbModelStore._setSyncRequired(metaData);
        await toVoidPromise(modelMetaDataStore.put(metaData));
      }
    });
  }

  public modelCreated(modelId: string): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store
    ];

    return this._withWriteStores(stores, async ([creationStore, modelMetaDataStore]) => {
      creationStore.delete(modelId);
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));
      metaData.available = 1;
      delete metaData.created;
      IdbModelStore._setSyncRequired(metaData);
      await toVoidPromise(modelMetaDataStore.put(metaData));
    });
  }

  public deleteIfNotNeeded(modelId: string): Promise<boolean> {
    const storeNames = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withWriteStores(
      storeNames,
      async ([createStore, metaDataStore, dataStore, localOpStore, serverOpStore]) => {
        const metaData = await toPromise<IModelMetaDataDocument>(metaDataStore.get(modelId));
        if (metaData && !IdbModelStore._isMetaDataNeeded(metaData)) {
          await IdbModelStore._deleteModel(
            modelId, createStore, metaDataStore, dataStore, localOpStore, serverOpStore);
          return true;
        } else {
          return false;
        }
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
      await IdbModelStore._putModelState(modelState, modelMetaData, modelDataStore, localOpStore, serverOpStore);
    });
  }

  public updateOfflineModel(update: IModelUpdate): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelServerOperation.Store,
    ];

    return this._withWriteStores(stores, async ([modelMetaDataStore, modelDataStore, serverOpStore]) => {
      const {modelId, dataUpdate, permissionsUpdate} = update;
      const modelMetaData: IModelMetaData = await toPromise(modelMetaDataStore.get(modelId));

      if (modelMetaData === undefined) {
        // This could happen if we unsubscribed.
        return;
      }

      if (modelMetaData.uncommitted) {
        // If we allow this to go through the uncommitted local operations
        // would no longer be compatible to the document state.
        throw new Error(`A model update was received for an model ('${modelId}')with uncommitted operations.`);
      }

      await IdbModelStore._deleteServerOperationsForModel(serverOpStore, modelId);

      if (dataUpdate) {
        modelMetaData.details.version = dataUpdate.version;
        modelMetaData.details.createdTime = dataUpdate.createdTime;
        modelMetaData.details.modifiedTime = dataUpdate.modifiedTime;

        // We know the model does not have any uncommitted operations.
        // thus the data we are about to store incorporates all the way
        // up to the last sequence number.
        modelMetaData.details.snapshotSequenceNumber = modelMetaData.details.lastSequenceNumber;
        modelMetaData.details.snapshotVersion = dataUpdate.version;

        const data: IModelData = {
          modelId,
          data: dataUpdate.data
        };
        await toVoidPromise(modelDataStore.put(data));
      }

      if (permissionsUpdate) {
        modelMetaData.details.permissions = permissionsUpdate;
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

  public getModelsRequiringSync(): Promise<IModelMetaData[]> {
    return this._withReadStore(IdbSchema.ModelMetaData.Store, (store) => {
      const idx = store.index(IdbSchema.ModelMetaData.Indices.SyncRequired);
      return toPromise(idx.getAll()).then((docs: IModelMetaDataDocument[]) =>
        docs.map(IdbModelStore._metaDataDocToMetaData));
    });
  }

  public processServerOperation(serverOp: IServerOperationData): Promise<void> {
    if (!serverOp) {
      throw new Error("serverOp was undefined.");
    }

    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelServerOperation.Store
    ];

    return this._withWriteStores(stores, async ([modelMetaDataStore, serverOpStore]) => {
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(serverOp.modelId));

      if (!metaData) {
        throw new Error(
          `Model meta data for model '${serverOp.modelId}' not found when processing a server operation.`);
      }

      if (!metaData.details) {
        throw new Error(
          `Can't store server operation for Model '${serverOp.modelId}' because the model details are missing from storage.`);
      }

      metaData.details.version = serverOp.version + 1;
      metaData.details.modifiedTime = serverOp.timestamp;

      await toVoidPromise(serverOpStore.add(serverOp));
      await toVoidPromise(modelMetaDataStore.put(metaData));
    });
  }

  public processLocalOperation(localOp: ILocalOperationData): Promise<void> {
    if (!localOp) {
      throw new Error("localOp was undefined.");
    }

    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelLocalOperation.Store
    ];

    return this._withWriteStores(stores, async ([modelMetaDataStore, localOpStore]) => {
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(localOp.modelId));
      if (!metaData) {
        throw new Error(`Model meta data for model '${localOp.modelId}' not found when processing a local operation.`);
      }

      if (!metaData.details) {
        throw new Error(
          `Can't store local operation for Model '${localOp.modelId}' because the model details are missing from storage.`);
      }

      metaData.uncommitted = 1;
      metaData.details.lastSequenceNumber = localOp.sequenceNumber;
      IdbModelStore._setSyncRequired(metaData);

      await toVoidPromise(localOpStore.add(localOp));
      await toVoidPromise(modelMetaDataStore.put(metaData));
    });
  }

  public processOperationAck(modelId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    const stores = [
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store,
      IdbSchema.ModelMetaData.Store
    ];

    return this._withWriteStores(stores, async ([localOpStore, serverOpStore, modelMetaDataStore]) => {
      const metaData = await toPromise<IModelMetaDataDocument>(modelMetaDataStore.get(modelId));

      if (!metaData) {
        throw new Error(`Model meta data for model '${modelId}' not found when processing a local operation acknowledgement.`);
      }

      if (!metaData.details) {
        throw new Error(
          `Can't store operation ack for Model '${modelId}' because the model details are missing from storage.`);
      }

      metaData.details.version = serverOp.version + 1;
      metaData.details.modifiedTime = serverOp.timestamp;

      await toVoidPromise(localOpStore.delete([modelId, seqNo]));
      await toVoidPromise(serverOpStore.add(serverOp));

      const idx = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
      const dirty = await toPromise(idx.count(modelId)).then((count => count > 0));
      if (dirty) {
        metaData.uncommitted = 1;
      } else {
        delete metaData.uncommitted;
      }

      IdbModelStore._setSyncRequired(metaData);

      await toVoidPromise(modelMetaDataStore.put(metaData));
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
        const meta: IModelMetaDataDocument = await toPromise(modelMetaDataStore.get(modelId));
        const data: IModelData = await toPromise(modelDataStore.get(modelId));
        if (meta && data) {
          const localOpsIndex = localOpStore.index(IdbSchema.ModelLocalOperation.Indices.ModelId);
          const localOperations = await toPromise(localOpsIndex.getAll(modelId));

          const serverOpsIndex = serverOpStore.index(IdbSchema.ModelServerOperation.Indices.ModelId);
          const serverOperations = await toPromise(serverOpsIndex.getAll(modelId));
          const snapshot: IModelSnapshot = {
            version: meta.details.snapshotVersion,
            sequenceNumber: meta.details.snapshotSequenceNumber,
            data: data.data,
            localOperations,
            serverOperations
          };

          const version = meta.details.version;
          const lastSequenceNumber = meta.details.lastSequenceNumber;

          return {
            modelId: meta.modelId,
            collection: meta.details.collection,
            createdTime: meta.details.createdTime,
            modifiedTime: meta.details.modifiedTime,
            version,
            lastSequenceNumber,
            valueIdPrefix: {...meta.details.valueIdPrefix},
            permissions: new ModelPermissions(
              meta.details.permissions.read,
              meta.details.permissions.write,
              meta.details.permissions.remove,
              meta.details.permissions.manage,
            ),

            local: meta.created === 1,
            snapshot
          } as IModelState;
        } else {
          return;
        }
      });
  }

  public getAllModelMetaData(): Promise<IModelMetaData[]> {
    return this._getAll(IdbSchema.ModelMetaData.Store)
      .then(results => results.map(IdbModelStore._metaDataDocToMetaData));
  }

  public getModelMetaData(modelId: string): Promise<IModelMetaData | undefined> {
    return this._withReadStore(IdbSchema.ModelMetaData.Store, (store) => {
      return toPromise<IModelMetaDataDocument>(store.get(modelId))
        .then(doc => {
          if (doc) {
            return IdbModelStore._metaDataDocToMetaData(doc);
          }
        });
    });
  }

  public setModelSubscriptions(modelIds: string[]): Promise<void> {
    const storeNames = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withWriteStores(
      storeNames,
      async ([createStore, metaDataStore, dataStore, localOpStore, serverOpStore]) => {
        const index = metaDataStore.index(IdbSchema.ModelMetaData.Indices.Subscribed);
        const subscribed = await toPromise<IModelMetaDataDocument[]>(index.getAll());
        const subscribedModelIds = subscribed.map(s => s.modelId);
        const toAdd = modelIds.filter(id => !subscribedModelIds.includes(id));
        const toRemove = subscribedModelIds.filter(id => !modelIds.includes(id));

        await IdbModelStore._removeSubscriptions(
          toRemove, createStore, metaDataStore, dataStore, localOpStore, serverOpStore);
        await IdbModelStore._addSubscriptions(toAdd, metaDataStore);
      });
  }

  public getSubscribedModels(): Promise<IModelMetaData[]> {
    const storeName = IdbSchema.ModelMetaData.Store;
    return this._withReadStore(storeName, async (store) => {
      const index = store.index(IdbSchema.ModelMetaData.Indices.Subscribed);
      const subscribed = await toPromise<IModelMetaDataDocument[]>(index.getAll());
      return subscribed.map(IdbModelStore._metaDataDocToMetaData);
    });
  }

  public addSubscriptions(modelIds: string[]): Promise<void> {
    const storeName = IdbSchema.ModelMetaData.Store;
    return this._withWriteStore(storeName, (store) => IdbModelStore._addSubscriptions(modelIds, store));
  }

  public removeSubscriptions(modelIds: string[]): Promise<void> {
    const stores = [
      IdbSchema.ModelCreation.Store,
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelLocalOperation.Store,
      IdbSchema.ModelServerOperation.Store,
    ];

    return this._withWriteStores(stores,
      async ([createStore, modelMetaDataStore, modelDataStore, localOpStore, serverOpStore]) => {
        return IdbModelStore._removeSubscriptions(
          modelIds,
          createStore,
          modelMetaDataStore,
          modelDataStore,
          localOpStore,
          serverOpStore);
      });
  }

  public snapshotModel(modelId: string,
                       version: number,
                       sequenceNumber: number,
                       modelData: IObjectValue): Promise<void> {
    const stores = [
      IdbSchema.ModelMetaData.Store,
      IdbSchema.ModelData.Store,
      IdbSchema.ModelServerOperation.Store
    ];
    return this._withWriteStores(stores,
      async ([metaDataStore, modelDataStore, serverOpStore]) => {

        const meta = await toPromise<IModelMetaDataDocument>(metaDataStore.get(modelId));
        meta.details.snapshotVersion = version;
        meta.details.snapshotSequenceNumber = sequenceNumber;

        await toVoidPromise(metaDataStore.put(meta));

        const data: IModelData = {
          modelId,
          data: modelData
        };
        await toVoidPromise(modelDataStore.put(data));

        await IdbModelStore._deleteServerOperationsForModel(serverOpStore, modelId);
      });
  }

  public claimValueIdPrefix(modelId: string): Promise<{ prefix: string, increment: number }> {
    return this._withWriteStore(IdbSchema.ModelMetaData.Store, async (store) => {
      const meta = await toPromise<IModelMetaDataDocument>(store.get(modelId));

      if (!meta || !meta.details) {
        throw new ConvergenceError("No such offline model available: " + modelId);
      }

      const result = {...meta.details.valueIdPrefix};

      meta.details.valueIdPrefix.increment = meta.details.valueIdPrefix.increment + 1;

      await toVoidPromise(store.put(meta));

      return result;
    });
  }
}

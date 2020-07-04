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

import {StorageEngine} from "../storage/StorageEngine";
import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {ServerOperationEvent} from "./ot/ServerOperationEvent";
import {toOfflineOperationData} from "../storage/OfflineOperationMapper";
import {RealTimeModel} from "./rt";
import {
  ILocalOperationData,
  IModelCreationData,
  IModelMetaData,
  IModelSnapshot,
  IModelState,
  IModelUpdate,
  IServerOperationData
} from "../storage/api/";
import {Logging} from "../util/log/Logging";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ReplayDeferred} from "../util/ReplayDeferred";
import {getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {toModelPermissions, toObjectValue} from "./ModelMessageConverter";
import {ConvergenceEventEmitter, IConvergenceEvent} from "../util";
import {ModelPermissions} from "./ModelPermissions";
import {
  ModelCommittedEvent,
  ModelModifiedEvent,
  OfflineModelDeletedEvent,
  OfflineModelDownloadedEvent,
  OfflineModelPermissionsRevokedEvent,
  OfflineModelsDownloadStartedEvent,
  OfflineModelsDownloadStatusChangedEvent,
  OfflineModelsDownloadStoppedEvent,
  OfflineModelStatusChangedEvent,
  OfflineModelUpdatedEvent
} from "./events/";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IOfflineModelUpdatedMessage = com.convergencelabs.convergence.proto.model.IOfflineModelUpdatedMessage;
import IModelOfflineSubscriptionData = com.convergencelabs.convergence.proto
  .model.ModelOfflineSubscriptionChangeRequestMessage.IModelOfflineSubscriptionData;

/**
 * @hidden
 * @internal
 */
export class ModelOfflineManager extends ConvergenceEventEmitter<IConvergenceEvent> {
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

  private readonly _offlineModels: Map<string, IOfflineModelInfo>;
  private readonly _openModels: Map<string, IOpenModelRecord>;
  private readonly _storage: StorageEngine;
  private readonly _connection: ConvergenceConnection;
  private readonly _ready: ReplayDeferred<void>;
  private readonly _snapshotInterval: number;
  private readonly _log = Logging.logger("models.offline");

  private _online: boolean;
  private _downloadInProgress: boolean;
  private _modelsToDownload: number;

  constructor(connection: ConvergenceConnection, snapshotInterval: number, storage: StorageEngine) {
    super();
    this._connection = connection;
    this._storage = storage;
    this._offlineModels = new Map();
    this._openModels = new Map();
    this._ready = new ReplayDeferred<void>();
    this._snapshotInterval = snapshotInterval;

    this._online = false;

    this._downloadInProgress = false;
    this._modelsToDownload = 0;

    this._connection
      .messages()
      .subscribe((messageEvent: MessageEvent) => {
        const message = messageEvent.message;
        if (message.modelOfflineUpdated) {
          this._handleModelOfflineUpdated(message.modelOfflineUpdated);
        }
      });
  }

  public async init(): Promise<void> {
    this._log.debug("Initializing offline model manager");
    try {
      const models = await this._storage.modelStore().getAllModelMetaData();

      for (const modelMetaData of models) {
        // If we are subscribed we know we need the model and we add it
        // to the subscribed models.
        const entry: IOfflineModelInfo = {
          version: modelMetaData.details ? modelMetaData.details.version : 0,
          permissions: modelMetaData.details ?
            ModelPermissions.fromJSON(modelMetaData.details.permissions) : undefined,
          available: modelMetaData.available,
          subscribed: modelMetaData.subscribed,
          local: modelMetaData.created,
          synchronized: !modelMetaData.uncommitted
        }
        this._offlineModels.set(modelMetaData.modelId, entry);

        if (!modelMetaData.subscribed) {
          // We are not subscribe, purge this model if it was not here
          // because it was not cleanly closed.
          const deleted = await this._storage.modelStore().deleteIfNotNeeded(modelMetaData.modelId);
          if (deleted) {
            this._offlineModels.delete(modelMetaData.modelId);
          }
        }
      }

      this._checkAndUpdateModelDownloadStatus(false);

      this._ready.resolve();
    } catch (e) {
      this._log.error("Error initializing offline model manager", e);
      this._ready.reject(e);
    }
  }

  public isOfflineEnabled(): boolean {
    return this._storage.isEnabled();
  }

  public ready(): Promise<void> {
    return this._ready.promise();
  }

  public setOnline(): Promise<void> {
    this._online = true;
    return this._resubscribe();
  }

  public setOffline(): void {
    this._online = false;
    if (this._downloadInProgress) {
      this._handleDownloadStopped();
    }
  }

  public modelOpened(model: RealTimeModel, opsSinceSnapshot: number): void {
    const record = {model, opsSinceSnapshot};
    this._openModels.set(model.modelId(), record);

    model.on(RealTimeModel.Events.MODIFIED, this._modelModified);
    model.on(RealTimeModel.Events.COMMITTED, this._modelCommitted);
  }

  public modelClosed(model: RealTimeModel): void {
    this._openModels.delete(model.modelId());
    this._deleteIfNotNeeded(model.modelId())
      .catch(e => this._log.error("Error cleaning up model after close", e));

    model.off(RealTimeModel.Events.MODIFIED, this._modelModified);
    model.off(RealTimeModel.Events.COMMITTED, this._modelCommitted);
  }

  public isModelSubscribed(modelId: string): boolean {
    return this._offlineModels.has(modelId) && this._offlineModels.get(modelId).subscribed;
  }

  public getSubscribedModelIds(): string[] {
    return Array.from(this._offlineModels.keys());
  }

  public getModelsRequiringSync(): Promise<IModelMetaData[]> {
    return this._storage.modelStore().getModelsRequiringSync();
  }

  public subscribe(modelIds: string[]): Promise<void> {
    const notSubscribed = modelIds.filter(id => !this.isModelSubscribed(id));
    notSubscribed.forEach((modelId) => this._handleNewSubscriptions(modelId));

    this._checkAndUpdateModelDownloadStatus(false);

    return this._storage
      .modelStore()
      .addSubscriptions(notSubscribed)
      .then(() => {
        // Even though we don't need the data for all of them, we still need to let the server know
        // about all of them.
        const request = notSubscribed.map(modelId => {
          if (this._openModels.has(modelId)) {
            const model = this._openModels.get(modelId);
            return {
              modelId,
              version: model.model.version(),
              permissions: model.model.permissions().toJSON()
            };
          } else {
            return {modelId, version: 0};
          }
        });

        return this._sendSubscriptionRequest(request, [], false);
      });
  }

  public unsubscribe(modelIds: string[]): Promise<void> {
    const subscribed = modelIds.filter(id => this.isModelSubscribed(id));
    subscribed.forEach(modelId => this._handleUnsubscribed(modelId));
    this._checkAndUpdateModelDownloadStatus(false);

    return this._storage
      .modelStore()
      .removeSubscriptions(modelIds)
      .then(() => {
        return this._sendSubscriptionRequest([], subscribed, false);
      });
  }

  public setSubscriptions(modelIds: string[]): Promise<void> {
    const subscribedModels = this._getSubscribedModelIds();
    // process model ids that need to be subscribed.
    const subscribe = modelIds.filter(id => !subscribedModels.has(id));
    subscribe.forEach(modelId => this._handleNewSubscriptions(modelId));

    // process model ids that need to be unsubscribed.
    const unsubscribe = Array.from(subscribedModels).filter(id => !modelIds.includes(id));
    unsubscribe.forEach(modelId => this._handleUnsubscribed(modelId));

    // Iterate over what is now subscribed, and send that over.
    const subscriptions: string[] = Array.from(this._offlineModels.keys());

    const requests: IModelOfflineSubscriptionData[] = subscriptions.map(modelId => {
      const record = this._offlineModels.get(modelId);
      return {
        modelId,
        currentVersion: record.version,
        currentPermissions: record.permissions
      };
    });

    this._checkAndUpdateModelDownloadStatus(false);

    return this._storage
      .modelStore()
      .setModelSubscriptions(subscriptions)
      .then(() => {
        return this._sendSubscriptionRequest(requests, [], true);
      });
  }

  public getModelCreationData(modelId: string): Promise<IModelCreationData> {
    return this._storage.modelStore().getModelCreationData(modelId);
  }

  public modelCreated(modelId: string): Promise<void> {
    return this._storage.modelStore().modelCreated(modelId)
      .then(() => this._deleteIfNotNeeded(modelId));
  }

  public createOfflineModel(creationData: IModelCreationData): Promise<void> {
    this._offlineModels.set(creationData.modelId, {
      subscribed: false,
      available: true,
      synchronized: false,
      local: true,
      version: 0
    });

    return this._storage
      .modelStore()
      .createModelOffline(creationData)
      .then(() => {
        this._emitOfflineStatusChanged(creationData.modelId);
      });
  }

  public getOfflineModelState(modelId: string): Promise<IModelState | undefined> {
    return this._storage.modelStore().getModelState(modelId);
  }

  public claimValueIdPrefix(modelId: string): Promise<{ prefix: string, increment: number }> {
    return this._storage.modelStore().claimValueIdPrefix(modelId);
  }

  public getModelMetaData(modelId: string): Promise<IModelMetaData> {
    return this._storage.modelStore().getModelMetaData(modelId);
  }

  public getAllModelMetaData(): Promise<IModelMetaData[]> {
    return this._storage.modelStore().getAllModelMetaData();
  }

  public processLocalOperation(modelId: string, clientEvent: ClientOperationEvent): Promise<void> {
    const localOpData = ModelOfflineManager._mapClientOperationEvent(modelId, clientEvent);
    return this._storage.modelStore()
      .processLocalOperation(localOpData)
      .then(() => this._handleOperation(modelId));
  }

  public processOperationAck(modelId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore()
      .processOperationAck(modelId, seqNo, serverOp);
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

    return this._storage.modelStore()
      .processServerOperation(serverOp, currentLocalOps)
      .then(() => this._handleOperation(modelId));
  }

  public markModelForDeletion(modelId: string): Promise<void> {
    this._offlineModels.delete(modelId);
    return this._storage.modelStore().deleteModel(modelId)
      .then(() => this._deleteIfNotNeeded(modelId));
  }

  public modelDeleted(modelId: string): Promise<void> {
    return this._storage.modelStore().modelDeleted(modelId)
      .then(() => this._deleteIfNotNeeded(modelId));
  }

  public storeOpenModelOffline(model: RealTimeModel): Promise<void> {
    const snapshot = this._getSnapshot(model);
    const version = model.version();

    const state: IModelState = {
      modelId: model.modelId(),
      collection: model.collectionId(),

      valueIdPrefix: {
        prefix: model._valueIdPrefix(),
        increment: 0
      },

      version,
      lastSequenceNumber: snapshot.sequenceNumber,

      createdTime: model.createdTime(),
      modifiedTime: model.time(),

      local: model.isLocal(),

      permissions: model.permissions(),
      snapshot
    };
    return this._storage.modelStore().putModelState(state);
  }

  private _resubscribe(): Promise<void> {
    this._checkAndUpdateModelDownloadStatus(false);
    const subscriptionRequest: IModelOfflineSubscriptionData[] = [];
    this._offlineModels.forEach((record, modelId) => {
      subscriptionRequest.push({
        modelId,
        currentPermissions: record.permissions ? record.permissions.toJSON() : undefined,
        currentVersion: record.version ? record.version : 0
      });
    });

    return this._sendSubscriptionRequest(subscriptionRequest, [], true);
  }

  private _handleNewSubscriptions(modelId: string): void {
    const model = this._offlineModels.get(modelId)
    if (model) {
      if (model.subscribed) {
        throw new Error(`Model is already subscribed: ${modelId}`);
      } else {
        model.subscribed = true;
      }
    } else {
      const entry: IOfflineModelInfo = {
        version: 0,
        subscribed: true,
        available: false,
        local: false,
        synchronized: true
      }
      this._offlineModels.set(modelId, entry);
    }

    this._emitOfflineStatusChanged(modelId);
  }

  private _handleUnsubscribed(modelId: string): void {
    const entry = this._offlineModels.get(modelId);
    // If the model is available local we don't delete
    // the entry since we are still tracking it.
    if (entry) {
      entry.subscribed = false;
      this._deleteOfflineModelRecordIfNotNeeded(modelId);
    }

    this._emitOfflineStatusChanged(modelId);
  }

  private _deleteOfflineModelRecordIfNotNeeded(modelId: string): void {
    const entry = this._offlineModels.get(modelId);
    // If the model is available local we don't delete
    // the entry since we are still tracking it.
    if (entry && !entry.subscribed && !entry.local && entry.synchronized) {
      this._offlineModels.delete(modelId);
    }
  }

  private _sendSubscriptionRequest(subscribe: IModelOfflineSubscriptionData[],
                                   unsubscribe: string[],
                                   all: boolean): Promise<void> {
    const change = all || subscribe.length > 0 || unsubscribe.length > 0;
    if (this._online && change) {
      const message: IConvergenceMessage = {
        modelOfflineSubscriptionChange: {
          subscribe,
          unsubscribe,
          all
        }
      };
      return this._connection.request(message).then(() => undefined);
    } else {
      return Promise.resolve();
    }
  }

  private _handleModelOfflineUpdated(message: IOfflineModelUpdatedMessage): void {
    const modelId = getOrDefaultString(message.modelId);

    // If the model is open this is going to be handled by the open
    // real time model.
    if (!this._openModels.has(modelId)) {
      if (getOrDefaultBoolean(message.deleted)) {
        // FIXME.. review if this is correct.  It seems like we should be calling
        //  a method that indicates a delete.
        this._storage.modelStore().removeSubscriptions([modelId])
          .then(() => {
            this._offlineModels.delete(modelId);

            const deletedEvent = new OfflineModelDeletedEvent(modelId);
            this._emitEvent(deletedEvent);

            this._emitOfflineStatusChanged(modelId);

            this._checkAndUpdateModelDownloadStatus(false);
          })
          .catch(e => {
            // TODO emmit error event.
            this._log.error("Could not delete offline model.", e);
          });
      } else if (getOrDefaultBoolean(message.permissionRevoked)) {
        // TODO emmit a permissions revoked event.
        this._storage.modelStore()
          .removeSubscriptions([modelId])
          .then(() => {
            this._offlineModels.delete(modelId);

            const revokedEvent = new OfflineModelPermissionsRevokedEvent(modelId);
            this._emitEvent(revokedEvent);

            this._emitOfflineStatusChanged(modelId);

            this._checkAndUpdateModelDownloadStatus(false);
          })
          .catch(e => {
            // TODO emmit error event.
            this._log.error("Could not delete offline model after permissions revoked.", e);
          });
      } else if (message.initial) {
        if (this.isModelSubscribed(modelId)) {
          const {collection, model, permissions, valueIdPrefix} = message.initial;
          const modelPermissions = toModelPermissions(permissions);
          const version = getOrDefaultNumber(model.version);
          const modelState: IModelState = {
            modelId,
            collection,

            valueIdPrefix: {prefix: valueIdPrefix, increment: 0},

            version,
            lastSequenceNumber: 0,

            createdTime: timestampToDate(model.createdTime),
            modifiedTime: timestampToDate(model.modifiedTime),

            local: false,

            permissions: modelPermissions,

            snapshot: {
              version: getOrDefaultNumber(model.version),
              sequenceNumber: 0,

              data: toObjectValue(model.data),
              serverOperations: [],
              localOperations: []
            }
          };

          this._storage.modelStore().putModelState(modelState).catch(e => {
            this._log.error("Error synchronizing subscribed model from server", e);
          }).then(() => {
            this._offlineModels.set(modelId, {
              version,
              permissions: modelPermissions,
              available: true,
              subscribed: true,
              synchronized: true,
              local: false
            });

            this._emitEvent(new OfflineModelDownloadedEvent(modelId, version, modelPermissions));

            this._emitOfflineStatusChanged(modelId);

            this._checkAndUpdateModelDownloadStatus(true);
          });
        }
      } else if (message.updated) {
        if (this.isModelSubscribed(modelId)) {
          const {model, permissions} = message.updated;
          const dataUpdate: any = model ? {
            version: getOrDefaultNumber(model.version),
            createdTime: timestampToDate(model.createdTime),
            modifiedTime: timestampToDate(model.modifiedTime),
            data: toObjectValue(model.data)
          } : undefined;

          const permissionsUpdate = toModelPermissions(permissions);

          const update: IModelUpdate = {
            modelId,
            dataUpdate,
            permissionsUpdate
          };

          // We have already checked that the model is not open. We only
          // subscribe after we have synced any models with outstanding
          // changes.  So at this point, we have a model that is not open
          // and has no local changes. So it is safe to update it.
          this._storage.modelStore()
            .updateOfflineModel(update)
            .catch(e => {
              this._log.error("Error synchronizing subscribed model from server", e);
            })
            .then(() => {
              if (dataUpdate) {
                this._offlineModels.set(modelId, {
                  version: getOrDefaultNumber(model.version),
                  permissions: permissionsUpdate,
                  available: true,
                  subscribed: true,
                  local: false,
                  synchronized: true
                });
              }

              const modelPermissions = permissionsUpdate ? ModelPermissions.fromJSON(permissionsUpdate) : null;
              const version = dataUpdate ? dataUpdate.version : null;

              this._emitEvent(new OfflineModelUpdatedEvent(modelId, version, modelPermissions));
            });
        }
      }
    }
  }

  private _emitOfflineStatusChanged(modelId: string): void {
    const entry = this._offlineModels.get(modelId);
    const statusEvent = entry ?
      new OfflineModelStatusChangedEvent(modelId, entry.subscribed, entry.available, entry.synchronized, entry.local) :
      new OfflineModelStatusChangedEvent(modelId, false, false, false, false);
    this._emitEvent(statusEvent);
  }

  private async _handleOperation(modelId: string): Promise<void> {
    // Check to make sue we are subscribed. We may not be for a locally
    // created model that is just waiting to bee pushed up.
    if (this._openModels.has(modelId)) {
      let {model, opsSinceSnapshot} = this._openModels.get(modelId);

      opsSinceSnapshot++;

      if (opsSinceSnapshot >= this._snapshotInterval) {
        const snapshot = this._getSnapshot(model);
        await this._storage.modelStore()
          .snapshotModel(modelId, snapshot.version, snapshot.sequenceNumber, snapshot.data)
          .then(() => {
            opsSinceSnapshot = 0;
          })
          .catch(e => this._log.error("Error snapshotting model", e));
      }

      this._openModels.set(modelId, {model, opsSinceSnapshot});
    }
  }

  private _getSnapshot(model: RealTimeModel): IModelSnapshot {
    const modelStateSnapshot = model._getConcurrencyControlStateSnapshot();
    const localOperations = modelStateSnapshot.uncommittedOperations
      .map(op => ModelOfflineManager._mapClientOperationEvent(model.modelId(), op));
    const serverOperations: IServerOperationData [] = [];

    return {
      version: model.version(),
      sequenceNumber: modelStateSnapshot.lastSequenceNumber,
      data: modelStateSnapshot.data,
      localOperations,
      serverOperations
    };
  }

  private _checkAndUpdateModelDownloadStatus(modelDownloaded: boolean): void {
    const howManyModelsNeeded = this._howManyModelsToDownload();
    const downloadsNeeded = howManyModelsNeeded > 0;

    if (this._modelsToDownload !== howManyModelsNeeded) {
      this._handleDownloadStatusChanged(modelDownloaded, howManyModelsNeeded);
    }

    if (this._online) {
      if (this._downloadInProgress && !downloadsNeeded) {
        this._handleDownloadStopped();
      } else if (!this._downloadInProgress && downloadsNeeded) {
        this._handleDownloadStarted(howManyModelsNeeded);
      }
    }
  }

  private _handleDownloadStarted(howManyModelsNeeded: number) {
    this._downloadInProgress = true;
    this._emitEvent(new OfflineModelsDownloadStartedEvent(howManyModelsNeeded));
  }

  private _handleDownloadStopped() {
    this._downloadInProgress = false;
    this._emitEvent(new OfflineModelsDownloadStoppedEvent());
  }

  private _handleDownloadStatusChanged(modelDownloaded: boolean, howManyModelsNeeded: number) {
    const trigger = modelDownloaded ? "download" : "subscription_changed";
    this._emitEvent(new OfflineModelsDownloadStatusChangedEvent(howManyModelsNeeded, trigger));
    this._modelsToDownload = howManyModelsNeeded;
  }

  private _howManyModelsToDownload(): number {
    let needed = 0;
    this._offlineModels.forEach(record => {
      if (!record.available) {
        needed++;
      }
    });

    return needed;
  }

  private _getSubscribedModelIds(): Set<string> {
    const subscribed = new Set<string>();
    this._offlineModels.forEach((v, k) => {
      if (v.subscribed) {
        subscribed.add(k);
      }
    });

    return subscribed;
  }

  private _deleteIfNotNeeded(modelId: string): Promise<void> {
    return this._storage.modelStore().deleteIfNotNeeded(modelId)
      .then(removed => {
        if (removed) {
          this._offlineModels.delete(modelId);
          this._emitOfflineStatusChanged(modelId);
        }
      });
  }

  private _modelCommitted = (event: ModelCommittedEvent) => {
    this._onCommitStateChanged(event.src);
  }

  private _modelModified = (event: ModelModifiedEvent) => {
    this._onCommitStateChanged(event.src);
  }

  private _onCommitStateChanged(model: RealTimeModel): void {
    // If the model is local, then it is already uncommitted and we
    // don't need to emit an event.  The only way the commit status
    // can change is when the model is not local.
    if (!model.isLocal()) {
      const entry = this._offlineModels.get(model.modelId());
      entry.synchronized = model.isCommitted();
      this._emitOfflineStatusChanged(model.modelId());
    }
  }
}

/**
 * @hidden
 * @internal
 */
interface IOfflineModelInfo {
  permissions?: ModelPermissions;
  version: number;
  available: boolean;
  subscribed: boolean;
  local: boolean;
  synchronized: boolean;
}

/**
 * @hidden
 * @internal
 */
interface IOpenModelRecord {
  model: RealTimeModel;
  opsSinceSnapshot: number;
}

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
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util";
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
import {ErrorEvent} from "../events";
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

  private readonly _offlineModels: Map<string, IOfflineModelState>;
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
      await this._initOfflineModels();

      this._checkAndUpdateModelDownloadStatus(false);

      this._ready.resolve();
    } catch (e) {
      this._ready.reject(e);
      // we only caught the exception so we can also reject
      // the ready deferred. Thus, we need to rethrow here.
      throw e;
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

    if (!this._offlineModels.has(model.modelId())) {
      this._offlineModels.set(model.modelId(), {
        subscribed: false,
        available: true,
        deleted: false,
        uncommited: !model.isCommitted(),
        created: model.isLocal(),
        version: model.version(),
        permissions: model.permissions()
      });

      this._emitOfflineStatusChanged(model.modelId());
    }

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

  public getSubscribedModelIds(): Set<string> {
    return new Set(this._offlineModels.keys());
  }

  public getModelsRequiringSync(): Promise<IModelMetaData[]> {
    return this._storage.modelStore().getModelsRequiringSync();
  }

  public subscribe(modelIds: string[]): Promise<void> {
    const subscribe = modelIds.filter(id => !this.isModelSubscribed(id));
    const unsubscribe = [];
    return this._updateSubscriptions(subscribe, unsubscribe, false);
  }

  public async unsubscribe(modelIds: string[]): Promise<void> {
    const subscribe = [];
    const unsubscribe = modelIds.filter(id => this.isModelSubscribed(id));
    return this._updateSubscriptions(subscribe, unsubscribe, false);
  }

  public setSubscriptions(modelIds: string[]): Promise<void> {
    const subscribe = modelIds.filter(modelId => this.isModelSubscribed(modelId));
    const unsubscribe = Array.from(this._getSubscribedModelIds()).filter(modelId => !modelIds.includes(modelId));
    return this._updateSubscriptions(subscribe, unsubscribe, true);
  }

  public getModelCreationData(modelId: string): Promise<IModelCreationData> {
    return this._storage.modelStore().getModelCreationData(modelId);
  }

  public modelCreated(modelId: string): Promise<void> {
    return this._storage.modelStore()
      .completeModelCreation(modelId)
      .then(() => {
        const entry = this._offlineModels.get(modelId);
        if (entry) {
          entry.created = false;
        }
        return this._deleteIfNotNeeded(modelId)
      });
  }

  public createOfflineModel(creationData: IModelCreationData): Promise<void> {
    return this._storage
      .modelStore()
      .initiateModelCreation(creationData)
      .then((metaData) => {
        this._offlineModels.set(creationData.modelId, {
          subscribed: false,
          available: true,
          uncommited: false,
          deleted: metaData.deleted,
          created: true,
          version: 0
        });
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

    const entry = this._offlineModels.get(modelId);
    if (entry) {
      entry.uncommited = true;
    }

    return this._storage
      .modelStore()
      .processLocalOperation(localOpData)
      .then(() => this._handleOperation(modelId));
  }

  public processOperationAck(modelId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {

    const entry = this._offlineModels.get(modelId);
    const model = this._openModels.get(modelId);
    if (entry && model) {
      entry.uncommited = !model.model.isCommitted();
    }

    return this._storage
      .modelStore()
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
    return this._storage.modelStore().initiateModelDeletion(modelId)
      .then(() => this._deleteIfNotNeeded(modelId));
  }

  public modelDeleted(modelId: string): Promise<void> {
    return this._storage.modelStore().completeModelDeletion(modelId)
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
    return this._storage.modelStore().setModelState(state);
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

  private async _initOfflineModels() {
    const offlineModels = await this._storage.modelStore().getAllModelMetaData();

    for (const modelMetaData of offlineModels) {
      // If we are subscribed we know we need the model and we add it
      // to the subscribed models.
      const entry: IOfflineModelState = {
        version: modelMetaData.details ? modelMetaData.details.version : 0,
        permissions: modelMetaData.details ?
          ModelPermissions.fromJSON(modelMetaData.details.permissions) : undefined,
        available: modelMetaData.available,
        subscribed: modelMetaData.subscribed,
        created: modelMetaData.created,
        deleted: modelMetaData.deleted,
        uncommited: modelMetaData.uncommitted
      }
      this._offlineModels.set(modelMetaData.modelId, entry);

      // It's possible that we have some orphaned models here
      // if we had something open and the app crashed. While
      // we are reinitializing we can clean up.
      await this._deleteIfNotNeeded(modelMetaData.modelId);
    }
  }

  private async _updateSubscriptions(subscribe: string[], unsubscribe: string[], setAll: boolean, silent: boolean = false): Promise<void> {
    if (setAll && unsubscribe.length !== 0) {
      return Promise.reject(new ConvergenceError("Unsubscribe must be empty when setting all subscriptions"));
    }

    subscribe.forEach((modelId) => this._setModeSubscribed(modelId));
    subscribe.forEach(id => this._emitOfflineStatusChanged(id));

    unsubscribe.forEach(id => this._setModelUnsubscribed(id));
    const toRemove = unsubscribe.filter(id => this._canBeDeleted(id));
    toRemove.forEach(id => this._offlineModels.delete(id));
    unsubscribe.forEach(id => this._emitOfflineStatusChanged(id));

    this._checkAndUpdateModelDownloadStatus(false);

    let toSubscribe: string[];
    let toUnsubscribe: string[];

    if (setAll) {
      toSubscribe = [];
      this._offlineModels.forEach((v, k) => {
        if (v.subscribed) {
          toSubscribe.push(k)
        }
      })
      toUnsubscribe = [];
    } else {
      toSubscribe = subscribe;
      toUnsubscribe = unsubscribe;
    }

    const subscriptionRequest = toSubscribe.map(modelId => {
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

    const modelStore = this._storage.modelStore();
    await modelStore.updateSubscriptions(subscribe, unsubscribe);
    await modelStore.deleteModels(toRemove);
    if (!silent) {
      return this._sendSubscriptionRequest(subscriptionRequest, toUnsubscribe, setAll);
    }
  }

  private _setModeSubscribed(modelId: string): void {
    const model = this._offlineModels.get(modelId)
    if (model) {
      if (model.subscribed) {
        throw new Error(`Model is already subscribed: ${modelId}`);
      } else {
        model.subscribed = true;
      }
    } else {
      const entry: IOfflineModelState = {
        version: 0,
        subscribed: true,
        available: false,
        created: false,
        deleted: false,
        uncommited: false
      }
      this._offlineModels.set(modelId, entry);
    }
  }

  private _setModelUnsubscribed(modelId: string): void {
    const entry = this._offlineModels.get(modelId);
    if (entry) {
      entry.subscribed = false;
    }
  }

  private _canBeDeleted(modelId: string): boolean {
    const entry = this._offlineModels.get(modelId);
    return entry !== undefined &&
      !entry.subscribed &&
      !entry.created &&
      !entry.uncommited &&
      !entry.deleted &&
      !this._openModels.has(modelId);
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

    // If the model is open the message will be handled by the open model.
    if (!this._openModels.has(modelId)) {
      if (getOrDefaultBoolean(message.deleted)) {
        this._handleOfflineModelDeleted(modelId);
      } else if (getOrDefaultBoolean(message.permissionRevoked)) {
        this._handleOfflineModelPermissionRevoked(modelId);
      } else if (message.initial) {
        this._handleOfflineModelInitialDownload(modelId, message);
      } else if (message.updated) {
        this._handleOfflineModelUpdated(modelId, message);
      }
    }
  }

  private _handleOfflineModelUpdated(modelId: string, message: com.convergencelabs.convergence.proto.model.IOfflineModelUpdatedMessage) {
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
        .processOfflineModelUpdate(update)
        .catch(e => {
          this._emitErrorEvent("Could not update offline model after download.", e);
        })
        .then(() => {
          const current = this._offlineModels.get(modelId);
          // Since this is all async it's entirely possible that
          // we have gotten rid of this model by now and that we
          // don't want to deal with this update now.
          if (current && current.available) {
            if (dataUpdate) {
              this._offlineModels.set(modelId, {
                version: getOrDefaultNumber(model.version),
                permissions: permissionsUpdate,
                available: true,
                subscribed: true,
                created: false,
                uncommited: false,
                deleted: false
              });
            }

            const modelPermissions = permissionsUpdate ? ModelPermissions.fromJSON(permissionsUpdate) : null;
            const version = dataUpdate ? dataUpdate.version : null;

            this._emitEvent(new OfflineModelUpdatedEvent(modelId, version, modelPermissions));
          }
        });
    }
  }

  private _handleOfflineModelInitialDownload(modelId: string, message: com.convergencelabs.convergence.proto.model.IOfflineModelUpdatedMessage) {
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

      this._storage
        .modelStore()
        .setModelState(modelState)
        .catch(e => this._emitErrorEvent("Could not store offline model after download.", e))
        .then(() => {
          this._offlineModels.set(modelId, {
            version,
            permissions: modelPermissions,
            available: true,
            subscribed: true,
            uncommited: false,
            created: false,
            deleted: false
          });

          this._emitEvent(new OfflineModelDownloadedEvent(modelId, version, modelPermissions));

          this._emitOfflineStatusChanged(modelId);

          this._checkAndUpdateModelDownloadStatus(true);
        });
    }
  }

  private _handleOfflineModelPermissionRevoked(modelId: string) {
    this._updateSubscriptions([], [modelId], false, true)
      .then(() => this._deleteIfNotNeeded(modelId))
      .then(() => {
        const revokedEvent = new OfflineModelPermissionsRevokedEvent(modelId);
        this._emitEvent(revokedEvent);

        this._emitOfflineStatusChanged(modelId);

        this._checkAndUpdateModelDownloadStatus(false);
      })
      .catch(e => this._emitErrorEvent("Could not delete offline model after permissions revoked.", e));
  }

  private _handleOfflineModelDeleted(modelId: string) {
    this._updateSubscriptions([], [modelId], false, true)
      .then(() => this._deleteIfNotNeeded(modelId))
      .then(() => {
        const deletedEvent = new OfflineModelDeletedEvent(modelId);
        this._emitEvent(deletedEvent);

        this._emitOfflineStatusChanged(modelId);

        this._checkAndUpdateModelDownloadStatus(false);
      })
      .catch(e => this._emitErrorEvent("Could not delete offline model after permissions revoked.", e));
  }

  private _emitOfflineStatusChanged(modelId: string): void {
    const entry = this._offlineModels.get(modelId);
    const statusEvent = entry ?
      new OfflineModelStatusChangedEvent(modelId, entry.subscribed, entry.available, !entry.uncommited, entry.created) :
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

  private async _deleteIfNotNeeded(modelId: string): Promise<void> {
    if (this._canBeDeleted(modelId)) {
      await this._storage.modelStore().deleteModels([modelId])
      this._offlineModels.delete(modelId);
      this._emitOfflineStatusChanged(modelId);
    }
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
      if (entry) {
        entry.uncommited = !model.isCommitted();
        this._emitOfflineStatusChanged(model.modelId());
      } else {
        this._log.warn(`Offline entry not found for open model (${model.modelId()}) handling commit state changed`);
      }
    }
  }

  private _emitErrorEvent(errorMessage: string, e) {
    this._emitEvent(new ErrorEvent(this._connection.session().domain(), errorMessage, e));
  }
}

/**
 * @hidden
 * @internal
 */
interface IOfflineModelState {
  permissions?: ModelPermissions;
  version: number;
  available: boolean;
  subscribed: boolean;
  created: boolean;
  deleted: boolean;
  uncommited: boolean;
}

/**
 * @hidden
 * @internal
 */
interface IOpenModelRecord {
  model: RealTimeModel;
  opsSinceSnapshot: number;
}

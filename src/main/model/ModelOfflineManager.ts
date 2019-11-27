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
  IModelCreationData,
  IModelUpdate,
  IModelSnapshot,
  ILocalOperationData,
  IServerOperationData,
  IModelState, IModelMetaData
} from "../storage/api/";
import {Logging} from "../util/log/Logging";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {ReplayDeferred} from "../util/ReplayDeferred";
import {getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {toModelPermissions, toObjectValue} from "./ModelMessageConverter";
import {ConvergenceEventEmitter, IConvergenceEvent} from "../util";
import {OfflineModelUpdatedEvent} from "./events/OfflineModelUpdatedEvent";
import {ModelPermissions} from "./ModelPermissions";
import {OfflineModelStatusChangedEvent} from "./events/OfflineModelStatusChangedEvent";
import {OfflineModelDeletedEvent} from "./events/OfflineModelDeletedEvent";
import {OfflineModelPermissionsRevokedEvent} from "./events/OfflineModelPermissionsRevokedEvent";
import {OfflineModelSyncCompleteEvent} from "./events/OfflineModelSyncPendingEvent";
import {OfflineModelSyncPendingEvent} from "./events/OfflineModelSyncCompleteEvent";

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

  private readonly _subscribedModels: Map<string, ISubscribedModelRecord>;
  private readonly _openModels: Map<string, RealTimeModel>;
  private readonly _syncInterval: number;
  private readonly _storage: StorageEngine;
  private readonly _connection: ConvergenceConnection;
  private readonly _ready: ReplayDeferred<void>;
  private readonly _snapshotInterval: number;

  constructor(connection: ConvergenceConnection,
              syncInterval: number,
              snapshotInterval: number,
              storage: StorageEngine) {
    super();
    this._connection = connection;
    this._syncInterval = syncInterval;
    this._storage = storage;
    this._subscribedModels = new Map();
    this._openModels = new Map();
    this._ready = new ReplayDeferred<void>();
    this._snapshotInterval = snapshotInterval;

    this._connection
      .messages()
      .subscribe((messageEvent: MessageEvent) => {
        const message = messageEvent.message;
        if (message.modelOfflineUpdated) {
          this._handleModelOfflineUpdated(message.modelOfflineUpdated);
        }
      });
  }

  public init(): void {
    this._storage.modelStore().getAllModelMetaData().then(modelSubscriptions => {
      modelSubscriptions.forEach(modelMetaData => {
        const version = modelMetaData.details ? modelMetaData.details.version : 0;
        this._subscribedModels.set(modelMetaData.modelId, {version, opsSinceSnapshot: 0, dirty: modelMetaData.dirty});
      });
      this._ready.resolve();
    }).catch(e => {
      ModelOfflineManager._log.error("Error initializing offline model manager.", e);
      this._ready.reject(e);
    });
  }

  public ready(): Promise<void> {
    return this._ready.promise();
  }

  public modelOpened(model: RealTimeModel): void {
    this._openModels.set(model.modelId(), model);
  }

  public modelClosed(model: RealTimeModel): void {
    this._openModels.delete(model.modelId());
    this._storage
      .modelStore()
      .deleteIfNotNeeded(model.modelId())
      .catch(e => ModelOfflineManager._log.error("Error cleaning up model after close", e));
  }

  public isModelSubscribed(modelId: string): boolean {
    return this._subscribedModels.has(modelId);
  }

  public getSubscribedModelIds(): string[] {
    return Array.from(this._subscribedModels.keys());
  }

  public getDirtyModelIds(): Promise<string[]> {
    return this._storage.modelStore().getDirtyModelIds();
  }

  public subscribe(modelIds: string[]): Promise<void> {
    const notSubscribed = modelIds.filter(id => !this._subscribedModels.has(id));
    if (notSubscribed.length > 0) {
      const event = new OfflineModelSyncPendingEvent();
      this._emitEvent(event);
    }

    return this._storage
      .modelStore()
      .addSubscriptions(notSubscribed)
      .then(() => {
        notSubscribed.forEach((modelId) => this._handleNewSubscriptions(modelId));
        return this._sendSubscriptionRequest(
          notSubscribed.map(m => {
            return {modelId: m, version: 0, dirty: false};
          }),
          [], false);
      });
  }

  public unsubscribe(modelIds: string[]): Promise<void> {
    const allBeforeUnsubscribe = this._allDownloaded();

    const subscribed = modelIds.filter(id => this._subscribedModels.has(id));
    return this._storage
      .modelStore()
      .removeSubscriptions(modelIds)
      .then(() => {
        subscribed.forEach(modelId => this._handleUnsubscribed(modelId));

        // If we weren't done before, but are now. Fire the event.
        if (!allBeforeUnsubscribe && this._allDownloaded()) {
          this._emitEvent(new OfflineModelSyncCompleteEvent());
        }
        return this._sendSubscriptionRequest([], subscribed, false);
      });
  }

  public setSubscriptions(modelIds: string[]): Promise<void> {
    const allBeforeUnsubscribe = this._allDownloaded();
    // process model ids that need to be subscribed.
    const subscribe = modelIds.filter(id => !this._subscribedModels.has(id));
    subscribe.forEach(modelId => this._handleNewSubscriptions(modelId));

    // process model ids that need to be unsubscribed.
    const unsubscribe = Array.from(this._subscribedModels.keys()).filter(id => !modelIds.includes(id));
    unsubscribe.forEach(modelId => this._handleUnsubscribed(modelId));

    // Iterate over what is now set, and send that over.
    const subscriptions: string[] = Array.from(this._subscribedModels.keys());

    const requests: IModelOfflineSubscriptionData[] = subscriptions.map(modelId => {
      const record = this._subscribedModels.get(modelId);
      return {
        modelId,
        currentVersion: record.version,
        currentPermissions: record.permissions
      };
    });

    if (subscribe.length > 0) {
      const event = new OfflineModelSyncPendingEvent();
      this._emitEvent(event);
    } else {
      // If we weren't done before, but are now. Fire the event.
      if (!allBeforeUnsubscribe && this._allDownloaded()) {
        this._emitEvent(new OfflineModelSyncCompleteEvent());
      }
    }

    return this._storage
      .modelStore()
      .setModelSubscriptions(subscriptions)
      .then(() => {
        return this._sendSubscriptionRequest(requests, [], true);
      });
  }

  public resubscribe(): Promise<void> {
    return this._storage
      .modelStore()
      .getSubscribedModels()
      .then((subscriptions) => {
        return this._sendSubscriptionRequest(subscriptions, [], true);
      });
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
      .createLocalModel(creationData)
      .then(() => {
        this._subscribedModels.set(creationData.modelId, {opsSinceSnapshot: 0, dirty: true, version: 0});
      });
  }

  public getModelDataIfDirty(modelId: string): Promise<IModelState | undefined> {
    return this.getOfflineModelData(modelId).then(m => {
      if (m && m.snapshot && m.snapshot.dirty) {
        return m;
      } else {
        return;
      }
    });
  }

  public getOfflineModelData(modelId: string): Promise<IModelState | undefined> {
    return this._storage.modelStore().getModelState(modelId);
  }

  public getAllModelMetaData(): Promise<IModelMetaData[]> {
    return this._storage.modelStore().getAllModelMetaData();
  }

  public processLocalOperation(modelId: string, clientEvent: ClientOperationEvent): Promise<void> {
    this._checkIfDirtyChanged(modelId);

    const localOpData = ModelOfflineManager._mapClientOperationEvent(modelId, clientEvent);
    return this._storage.modelStore()
      .processLocalOperation(localOpData)
      .then(() => this._handleOperation(modelId, false, false));
  }

  public processOperationAck(modelId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    this._checkIfDirtyChanged(modelId);
    return this._storage.modelStore()
      .processOperationAck(modelId, seqNo, serverOp)
      .then(() => this._handleOperation(modelId, false, true));
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
      .then(() => this._handleOperation(modelId, true, false));
  }

  private _handleNewSubscriptions(modelId: string): void {
    this._subscribedModels.set(modelId, {version: 0, opsSinceSnapshot: 0, dirty: false});
    if (this._openModels.has(modelId)) {
      this._initOpenModelForOffline(this._openModels.get(modelId))
        .catch(e => {
          // FIXME use logging and emit error event.
          console.error(e);
        });
    }
  }

  private _handleUnsubscribed(modelId: string): void {
    this._subscribedModels.delete(modelId);
    if (this._openModels.has(modelId)) {
      this._openModels.get(modelId)._disableOffline();
    }
  }

  private _initOpenModelForOffline(rtModel: RealTimeModel): Promise<void> {
    rtModel._enableOffline();

    const localOps = rtModel._getUncommittedOperations();
    const localOperations = localOps
      .map(op => ModelOfflineManager._mapClientOperationEvent(rtModel.modelId(), op));
    const serverOperations: IServerOperationData [] = [];

    const snapshot = this._getSnapshot(rtModel);
    const version = rtModel.version();

    const state: IModelState = {version, snapshot, localOperations, serverOperations};
    return this._storage.modelStore().putModelState(state);
  }

  private _sendSubscriptionRequest(subscribe: IModelOfflineSubscriptionData[],
                                   unsubscribe: string[],
                                   all: boolean): Promise<void> {
    const change = all || subscribe.length > 0 || unsubscribe.length > 0;
    if (this._connection.isOnline() && change) {
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
        // TODO emmit a deleted event.
        this._storage.modelStore().removeSubscriptions([modelId])
          .then(() => {
            this._subscribedModels.delete(modelId);

            const deletedEvent = new OfflineModelDeletedEvent(modelId);
            this._emitEvent(deletedEvent);

            const statusEvent = new OfflineModelStatusChangedEvent(modelId, false, false, false, false);
            this._emitEvent(statusEvent);
          })
          .catch(e => {
            // TODO emmit error event.
            ModelOfflineManager._log.error("Could not delete offline model.", e);
          });
      } else if (getOrDefaultBoolean(message.permissionRevoked)) {
        // TODO emmit a permissions revoked event.
        this._storage.modelStore()
          .removeSubscriptions([modelId])
          .then(() => {
            this._subscribedModels.delete(modelId);

            const revokedEvent = new OfflineModelPermissionsRevokedEvent(modelId);
            this._emitEvent(revokedEvent);

            const statusEvent = new OfflineModelStatusChangedEvent(modelId, false, false, false, false);
            this._emitEvent(statusEvent);
          })
          .catch(e => {
            // TODO emmit error event.
            ModelOfflineManager._log.error("Could not delete offline model after permissions revoked.", e);
          });
      } else if (message.initial) {
        if (this._subscribedModels.has(modelId)) {
          const {collection, model, permissions} = message.initial;
          const {read, write, remove, manage} = toModelPermissions(permissions);
          const version = getOrDefaultNumber(model.version);
          const modelState: IModelState = {
            version,
            snapshot: {
              modelId,
              local: false,
              dirty: false,
              subscribed: true,
              collection,
              dataVersion: getOrDefaultNumber(model.version),
              seqNo: 0,
              createdTime: timestampToDate(model.createdTime),
              modifiedTime: timestampToDate(model.modifiedTime),
              data: toObjectValue(model.data),
              permissions: {read, write, remove, manage}
            },
            serverOperations: [],
            localOperations: []
          };

          this._storage.modelStore().putModelState(modelState).catch(e => {
            ModelOfflineManager._log.error("Error synchronizing subscribed model from server", e);
          }).then(() => {
            this._subscribedModels.set(modelId, {version, opsSinceSnapshot: 0, dirty: false});

            const statusEvent = new OfflineModelStatusChangedEvent(modelId, true, true, false, false);
            this._emitEvent(statusEvent);

            const modelPermissions = new ModelPermissions(read, write, remove, manage);
            const updateEvent = new OfflineModelUpdatedEvent(modelId, version, modelPermissions);
            this._emitEvent(updateEvent);

            if (this._allDownloaded()) {
              const event = new OfflineModelSyncCompleteEvent();
              this._emitEvent(event);
            }
          });
        }
      } else if (message.updated) {
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

        this._storage.modelStore().updateOfflineModel(update).catch(e => {
          ModelOfflineManager._log.error("Error synchronizing subscribed model from server", e);
        }).then(() => {
          if (dataUpdate) {
            this._subscribedModels.set(modelId, {
              version: getOrDefaultNumber(model.version),
              opsSinceSnapshot: 0,
              dirty: false
            });
          }

          const modelPermissions = permissionsUpdate ? ModelPermissions.fromJSON(permissionsUpdate) : null;
          const version = dataUpdate ? dataUpdate.version : null;
          const updateEvent = new OfflineModelUpdatedEvent(modelId, version, modelPermissions);
          this._emitEvent(updateEvent);
        });
      }
    }
  }

  private _handleOperation(modelId: string, serverOp: boolean, ack: boolean): void {
    // Check to make sue we are subscribe. We may not be for a locally
    // created model that is just waiting to bee pushed up.
    if (this._subscribedModels.has(modelId)) {
      let {version, opsSinceSnapshot, dirty} = this._subscribedModels.get(modelId);
      if (serverOp || ack) {
        version++;
      }

      if (!ack) {
        opsSinceSnapshot++;
      }

      if (opsSinceSnapshot >= this._snapshotInterval) {
        const model = this._openModels.get(modelId);
        const snapshot = this._getSnapshot(model);
        this._storage.modelStore()
          .snapshotModel(snapshot)
          .catch(e => ModelOfflineManager._log.error("Error snapshotting model", e));
        opsSinceSnapshot = 0;
      }

      this._subscribedModels.set(modelId, {version, opsSinceSnapshot, dirty});
    }
  }

  private _getSnapshot(model: RealTimeModel): IModelSnapshot {
    const modelStateSnapshot = model._getModelStateSnapshot();
    return {
      modelId: model.modelId(),
      collection: model.collectionId(),
      local: modelStateSnapshot.local,
      dirty: modelStateSnapshot.dirty,
      subscribed: this._subscribedModels.has(model.modelId()),
      dataVersion: model.version(),
      seqNo: modelStateSnapshot.seqNo,
      createdTime: model.createdTime(),
      modifiedTime: model.time(),
      permissions: model.permissions(),
      data: modelStateSnapshot.data
    };
  }

  private _allDownloaded(): boolean {
    let allDownloaded = true;
    this._subscribedModels.forEach(record => {
      if (record.version === 0) {
        allDownloaded = false;
      }
    });

    return allDownloaded;
  }

  private _checkIfDirtyChanged(modelId: string): void {
    const model = this._openModels.get(modelId);
    const {dirty, version, opsSinceSnapshot} = this._subscribedModels.get(modelId);
    const committed = model.isCommitted();
    if (committed === dirty) {
      this._subscribedModels.set(modelId, {dirty: !committed, version, opsSinceSnapshot});
      const event = new OfflineModelStatusChangedEvent(
        modelId,
        true,
        true,
        !committed,
        version === 0);
      this._emitEvent(event);

    }
  }
}

/**
 * @hidden
 * @internal
 */
interface ISubscribedModelRecord {
  version: number;
  permissions?: ModelPermissions;
  opsSinceSnapshot: number;
  dirty: boolean;
}

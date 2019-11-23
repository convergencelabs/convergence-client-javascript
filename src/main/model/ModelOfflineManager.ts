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
  IModelState
} from "../storage/api/";
import {Logging} from "../util/log/Logging";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {IOfflineModelSubscription} from "../storage/api/IOfflineModelSubscription";
import {ReplayDeferred} from "../util/ReplayDeferred";
import {ModelPermissions} from "./ModelPermissions";
import {getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {toObjectValue} from "./ModelMessageConverter";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IOfflineModelUpdatedMessage = com.convergencelabs.convergence.proto.model.IOfflineModelUpdatedMessage;
import IModelOfflineSubscriptionData = com.convergencelabs.convergence.proto
  .model.ModelOfflineSubscriptionChangeRequestMessage.IModelOfflineSubscriptionData;

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

  private static _getSnapshot(model: RealTimeModel): IModelSnapshot {
    const modelStateSnapshot = model._getModelStateSnapshot();
    return {
      modelId: model.modelId(),
      collection: model.collectionId(),
      local: modelStateSnapshot.local,
      dirty: modelStateSnapshot.dirty,
      version: model.version(),
      seqNo: modelStateSnapshot.seqNo,
      createdTime: model.createdTime(),
      modifiedTime: model.time(),
      permissions: model.permissions(),
      data: modelStateSnapshot.data
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
    this._storage.modelStore().getSubscribedModels().then(modelSubscriptions => {
      modelSubscriptions.forEach(subs => {
        this._subscribedModels.set(subs.modelId, {version: subs.version, opsSinceSnapshot: 0});
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
    return this._storage
      .modelStore()
      .addSubscriptions(notSubscribed)
      .then(() => {
        notSubscribed.forEach((modelId) => this._handleNewSubscriptions(modelId));
        return this._sendSubscriptionRequest(
          notSubscribed.map(m => {
            return {modelId: m, version: 0};
          }),
          [], false);
      });
  }

  public unsubscribe(modelIds: string[]): Promise<void> {
    const subscribed = modelIds.filter(id => this._subscribedModels.has(id));
    return this._storage
      .modelStore()
      .removeSubscriptions(modelIds)
      .then(() => {
        subscribed.forEach(modelId => this._handleUnsubscribed(modelId));
        return this._sendSubscriptionRequest([], subscribed, false);
      });
  }

  public setSubscriptions(modelIds: string[]): Promise<void> {
    // process model ids that need to be subscribed.
    const subscribe = modelIds.filter(id => !this._subscribedModels.has(id));
    subscribe.forEach(modelId => this._handleNewSubscriptions(modelId));

    // process model ids that need to be unsubscribed.
    const unsubscribe = Array.from(this._subscribedModels.keys()).filter(id => !modelIds.includes(id));
    unsubscribe.forEach(modelId => this._handleUnsubscribed(modelId));

    // Iterate over what is now set, and send that over.
    const subscriptions: IOfflineModelSubscription[] = [];
    this._subscribedModels.forEach((record, modelId) => {
      subscriptions.push({modelId, version: record.version});
    });

    return this._storage
      .modelStore()
      .setModelSubscriptions(subscriptions)
      .then(() => {
        return this._sendSubscriptionRequest(subscriptions, [], true);
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
      .createLocalModel(creationData);
  }

  public getModelDataIfDirty(modelId: string): Promise<IModelState | undefined> {
    return Promise.resolve(undefined);
  }

  public getOfflineModelData(modelId: string): Promise<IModelState | undefined> {
    return this._storage
      .modelStore()
      .getModelState(modelId);
  }

  public processLocalOperation(modelId: string, clientEvent: ClientOperationEvent): Promise<void> {
    const localOpData = ModelOfflineManager._mapClientOperationEvent(modelId, clientEvent);
    return this._storage.modelStore()
      .processLocalOperation(localOpData)
      .then(() => this._handleOperation(modelId, false, false));
  }

  public processOperationAck(modelId: string,
                             sessionId: string,
                             seqNo: number,
                             serverOp: IServerOperationData): Promise<void> {
    return this._storage.modelStore()
      .processOperationAck(modelId, sessionId, seqNo, serverOp)
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
    this._subscribedModels.set(modelId, {version: 0, opsSinceSnapshot: 0});
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

    const snapshot = ModelOfflineManager._getSnapshot(rtModel);

    const state: IModelState = {snapshot, localOperations, serverOperations};
    return this._storage.modelStore().putModelState(state);
  }

  private _sendSubscriptionRequest(subscribe: IOfflineModelSubscription[],
                                   unsubscribe: string[],
                                   all: boolean): Promise<void> {
    const change = all || subscribe.length > 0 || unsubscribe.length > 0;
    if (this._connection.isOnline() && change) {
      const subs: IModelOfflineSubscriptionData[] = subscribe.map(({modelId, version}) => {
        return {modelId, currentVersion: version};
      });
      const message: IConvergenceMessage = {
        modelOfflineSubscriptionChange: {
          subscribe: subs,
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
        this._storage.modelStore().removeSubscriptions([modelId]).catch(e => {
          // TODO emmit error event.
          ModelOfflineManager._log.error("Could not delete offline model.", e);
        });
      } else if (getOrDefaultBoolean(message.permissionRevoked)) {
        // TODO emmit a permissions revoked event.
        this._storage.modelStore().removeSubscriptions([modelId]).catch(e => {
          // TODO emmit error event.
          ModelOfflineManager._log.error("Could not delete offline model.", e);
        });
      } else if (message.updated) {
        const {model, permissions} = message.updated;
        const dataUpdate: any = model ? {
          version: getOrDefaultNumber(model.version),
          createdTime: timestampToDate(model.createdTime),
          modifiedTime: timestampToDate(model.modifiedTime),
          data: toObjectValue(model.data)
        } : undefined;

        const permissionsUpdate = permissions ?
          new ModelPermissions(
            getOrDefaultBoolean(permissions.read),
            getOrDefaultBoolean(permissions.write),
            getOrDefaultBoolean(permissions.remove),
            getOrDefaultBoolean(permissions.manage),
          ) : undefined;

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
              opsSinceSnapshot: 0
            });
          }
        });
      }
    }
  }

  private _handleOperation(modelId: string, serverOp: boolean, ack: boolean): void {
    // Check to make sue we are subscribe. We may not be for a locally
    // created model that is just waiting to bee pushed up.
    if (this._subscribedModels.has(modelId)) {
      let {version, opsSinceSnapshot} = this._subscribedModels.get(modelId);
      if (serverOp || ack) {
        version++;
      }

      if (!ack) {
        opsSinceSnapshot++;
      }

      if (opsSinceSnapshot >= this._snapshotInterval) {
        const model = this._openModels.get(modelId);
        const snapshot = ModelOfflineManager._getSnapshot(model);
        this._storage.modelStore()
          .snapshotModel(snapshot)
          .catch(e => ModelOfflineManager._log.error("Error snapshotting model", e));
        opsSinceSnapshot = 0;
      }

      this._subscribedModels.set(modelId, {version, opsSinceSnapshot});
    }
  }
}

/**
 * @hidden
 * @internal
 */
interface ISubscribedModelRecord {
  version: number;
  opsSinceSnapshot: number;
}

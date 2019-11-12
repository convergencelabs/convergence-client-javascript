/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {StorageEngine} from "../storage/StorageEngine";
import {IModelState} from "../storage/api/IModelState";
import {ILocalOperationData, IServerOperationData} from "../storage/api";
import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {ServerOperationEvent} from "./ot/ServerOperationEvent";
import {toOfflineOperationData} from "../storage/OfflineOperationMapper";
import {RealTimeModel} from "./rt";
import {IModelCreationData} from "../storage/api/IModelCreationData";
import {Logging} from "../util/log/Logging";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {IOfflineModelSubscription} from "../storage/api/IOfflineModelSubscription";
import {Deferred} from "../util/Deferred";
import {ModelPermissions} from "./ModelPermissions";
import {getOrDefaultBoolean, getOrDefaultNumber, getOrDefaultString, timestampToDate} from "../connection/ProtocolUtil";
import {toObjectValue} from "./ModelMessageConverter";
import {IModelUpdate} from "../storage/api/IModelUpdate";

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

  private readonly _subscribedModels: Map<string, number>;
  private readonly _openModels: Map<string, RealTimeModel>;
  private readonly _syncInterval: number;
  private readonly _storage: StorageEngine;
  private readonly _connection: ConvergenceConnection;
  private readonly _ready: Deferred<void>;

  constructor(connection: ConvergenceConnection,
              syncInterval: number,
              snapshotInterval: number,
              storage: StorageEngine) {
    this._connection = connection;
    this._syncInterval = syncInterval;
    this._storage = storage;
    this._subscribedModels = new Map();
    this._openModels = new Map();
    this._ready = new Deferred<void>();

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
        this._subscribedModels.set(subs.modelId, subs.version);
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

  public getOfflineModelIds(): string[] {
    return Array.from(this._subscribedModels.keys());
  }

  public isOfflineEnabled(): boolean {
    return this._storage.isEnabled();
  }

  public subscribe(modelIds: string[]): Promise<void> {
    const notSubscribed = modelIds.filter(id => !this._subscribedModels.has(id));
    return this._storage
      .modelStore()
      .addSubscription(notSubscribed)
      .then(() => {
        notSubscribed.forEach((modelId) => this._handleNewSubscriptions(modelId));
        return this._sendSubscriptionRequest(
          notSubscribed.map(m => {
            return {modelId: m, version: 0};
          }),
          [], false);
      });
  }

  public unsubscribe(modelIds: string[]): void {
    const subscribed = modelIds.filter(id => this._subscribedModels.has(id));
    this._storage
      .modelStore()
      .removeSubscription(modelIds)
      .then(() => {
        subscribed.forEach(modelId => this._handleUnsubscribed(modelId));
        return this._sendSubscriptionRequest([], subscribed, false);
      });
  }

  public setSubscriptions(modelIds: string[]): void {
    // process model ids that need to be subscribed.
    const subscribe = modelIds.filter(id => !this._subscribedModels.has(id));
    subscribe.forEach(modelId => this._handleNewSubscriptions(modelId));

    // process model ids that need to be unsubscribed.
    const unsubscribe = Array.from(this._subscribedModels.keys()).filter(id => !modelIds.includes(id));
    unsubscribe.forEach(modelId => this._handleUnsubscribed(modelId));

    // Iterate over what is now set, and send that over.
    const subscriptions: IOfflineModelSubscription[] = [];
    this._subscribedModels.forEach((version, modelId) => {
      subscriptions.push({modelId, version});
    });

    this._storage
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

  private _handleNewSubscriptions(modelId: string): void {
    this._subscribedModels.set(modelId, 0);
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
    const offlineState = rtModel._enableOffline();
    const model = offlineState.model;
    const localOperations = offlineState.localOps
      .map(op => ModelOfflineManager._mapClientOperationEvent(rtModel.modelId(), op));
    const serverOperations: IServerOperationData [] = [];
    return this._storage.modelStore().putModelState({model, localOperations, serverOperations});
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
        this._storage.modelStore().deleteModel(modelId).catch(e => {
          // TODO emmit error event.
          ModelOfflineManager._log.error("Could not delete offline model.", e);
        });
      } else if (getOrDefaultBoolean(message.permissionRevoked)) {
        // TODO emmit a permissions revoked event.
        this._storage.modelStore().deleteModel(modelId).catch(e => {
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
        });
      }
    }
  }
}

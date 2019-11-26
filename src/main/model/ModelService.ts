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

import {ConvergenceSession} from "../ConvergenceSession";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {OperationTransformer} from "./ot/xform/OperationTransformer";
import {TransformationFunctionRegistry} from "./ot/xform/TransformationFunctionRegistry";
import {ClientConcurrencyControl} from "./ot/ClientConcurrencyControl";
import {Deferred} from "../util/Deferred";
import {ReplyCallback} from "../connection/ProtocolConnection";
import {ReferenceTransformer} from "./ot/xform/ReferenceTransformer";
import {ObjectValue} from "./dataValue";
import {DataValueFactory} from "./DataValueFactory";
import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../util";
import {RealTimeModel} from "./rt";
import {HistoricalModel} from "./historical";
import {ModelResult} from "./query";
import {ModelPermissionManager} from "./ModelPermissionManager";
import {ICreateModelOptions} from "./ICreateModelOptions";
import {ModelDataCallback, ModelDataInitializer} from "./ModelDataInitializer";
import {IAutoCreateModelOptions} from "./IAutoCreateModelOptions";
import {
  getModelMessageResourceId,
  modelUserPermissionMapToProto,
  toIObjectValue,
  toModelPermissions,
  toModelResult,
  toObjectValue
} from "./ModelMessageConverter";
import {
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  timestampToDate,
  toOptional
} from "../connection/ProtocolUtil";
import {IdentityCache} from "../identity/IdentityCache";
import {TypeChecker} from "../util/TypeChecker";
import {PagedData} from "../util/PagedData";
import {Validation} from "../util/Validation";
import {ModelOfflineManager} from "./ModelOfflineManager";
import {ModelDeletedEvent} from "./events";
import {ModelPermissions} from "./ModelPermissions";
import {IModelCreationData, IModelMetaData, IModelState} from "../storage/api/";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";
import {RandomStringGenerator} from "../util/RandomStringGenerator";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IAutoCreateModelConfigRequestMessage =
  com.convergencelabs.convergence.proto.model.IAutoCreateModelConfigRequestMessage;
import IReferenceData = com.convergencelabs.convergence.proto.model.IReferenceData;

/**
 * The complete list of events that could be emitted by the [[ModelService]].
 *
 * @module Real Time Data
 */
export interface ModelServiceEvents {
  /**
   * Emitted when a model is deleted. The actual event emitted is a [[ModelDeletedEvent]].
   *
   * @event [[ModelDeletedEvent]]
   */
  readonly MODEL_DELETED: "deleted";

  /**
   * Emitted when a model is initially downloaded after it was first subscribed
   * to offline. The event emitted will be an [[OfflineModelAvailableEvent]]
   *
   * @event [[OfflineModelAvailableEvent]]
   */
  readonly OFFLINE_MODEL_AVAILABLE: "offline_model_available";

  /**
   * Emitted whenever a model that is subscribed to offline is updated via the
   * periodic background synchronization process. the event emitted will be
   * an [[OfflineModelUpdatedEvent]]
   *
   * @event [[OfflineModelUpdatedEvent]]
   */
  readonly OFFLINE_MODEL_UPDATED: "offline_model_updated";

  /**
   * Emitted whenever a change to the set of subscribed models results in new
   * models needing to be downloaded. The event emitted will be an
   * [[OfflineModelSyncPendingEvent]].
   *
   * @event [[OfflineModelSyncPendingEvent]]
   */
  readonly OFFLINE_MODEL_SYNC_PENDING: "offline_model_sync_pending";

  /**
   * Emitted when all models have been downloaded after a subscription change
   * that required additional models to be downloaded. The event emitted
   * will be an [[OfflineModelSyncCompleteEvent]]
   *
   * @event [[OfflineModelSyncCompleteEvent]]
   */
  readonly OFFLINE_MODEL_SYNC_COMPLETED: "offline_model_sync_completed";
}

/**
 * @module Real Time Data
 */
export const ModelServiceEventConstants: ModelServiceEvents = {
  MODEL_DELETED: ModelDeletedEvent.NAME,
  OFFLINE_MODEL_AVAILABLE: "offline_model_available",
  OFFLINE_MODEL_UPDATED: "offline_model_updated",
  OFFLINE_MODEL_SYNC_PENDING: "offline_model_sync_pending",
  OFFLINE_MODEL_SYNC_COMPLETED: "offline_model_sync_completed",
};
Object.freeze(ModelServiceEventConstants);

/**
 * This is the main entry point in Convergence for working with
 * [real time data models](https://docs.convergence.io/guide/models/overview.html).
 * [[RealTimeModel]]s can be created, opened, deleted, and managed from the [[ModelService]].
 *
 * See [[ModelServiceEvents]] for the events that may be emitted on this model.
 *
 * @module Real Time Data
 */
export class ModelService extends ConvergenceEventEmitter<IConvergenceEvent> {

  /**
   * A mapping of the events this model could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * modelService.on(ModelService.Events.MODEL_DELETED, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: ModelServiceEvents = ModelServiceEventConstants;

  /**
   * @internal
   */
  private readonly _openModelRequests: Map<string, Deferred<RealTimeModel>> = new Map();

  /**
   * @internal
   */
  private readonly _openModels: Map<string, RealTimeModel> = new Map();

  /**
   * @internal
   */
  private readonly _resourceIdToModelId: Map<string, string> = new Map();

  /**
   * @internal
   */
  private readonly _resyncingModels: Map<string, RealTimeModel> = new Map();

  /**
   * @internal
   */
  private readonly _modelResyncQueue: string[];

  /**
   * @internal
   */
  private _syncDeferred: Deferred<void> | null;

  /**
   * @internal
   */
  private _autoRequestId: number;

  /**
   * @internal
   */
  private readonly _autoCreateRequests: Map<number, IAutoCreateModelOptions>;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  private readonly _modelOfflineManager: ModelOfflineManager;

  /**
   * @internal
   */
  private readonly _log: Logger;

  /**
   * @internal
   */
  private readonly _modelIdGenerator: RandomStringGenerator;

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              modelOfflineManager: ModelOfflineManager) {
    super();
    this._connection = connection;
    this._identityCache = identityCache;
    this._connection
      .messages()
      .subscribe(message => this._handleMessage(message));
    this._autoRequestId = 0;
    this._autoCreateRequests = new Map();

    this._connection.on(ConvergenceConnection.Events.INTERRUPTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.DISCONNECTED, this._setOffline);
    this._connection.on(ConvergenceConnection.Events.AUTHENTICATED, this._setOnline);

    this._modelResyncQueue = [];

    this._syncDeferred = null;

    this._modelOfflineManager = modelOfflineManager;

    this._modelIdGenerator = new RandomStringGenerator(32, RandomStringGenerator.AlphaNumeric);
    this._log = Logging.logger("models");
  }

  /**
   * @returns
   *  The ConvergenceSession attached to this domain.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Searches for models using the model [query syntax](https://docs.convergence.io/guide/models/queries.html).
   * Only `SELECT`s are currently supported.  The grammar is as follows:
   *
   * ```
   * SELECT [ * ]
   * [ FROM <Collection> ]
   * [ WHERE <Condition>* ]
   * [ ORDER BY (<Field> [ ASC|DESC ])* ]
   * [ LIMIT <MaxRecords> ]
   * [ OFFSET <SkipRecords> ]
   * ```
   *
   * @param query
   *   The query string to use to look up the model.
   *
   * @returns
   *   A promise that will be resolved with the query results.
   */
  public query(query: string): Promise<PagedData<ModelResult>> {
    Validation.assertNonEmptyString(query, "query");
    const request: IConvergenceMessage = {
      modelsQueryRequest: {
        query
      }
    };

    return this._connection
      .request(request)
      .then((response: IConvergenceMessage) => {
        const {modelsQueryResponse} = response;
        const data = getOrDefaultArray(modelsQueryResponse.models).map(toModelResult);
        const offset = getOrDefaultNumber(modelsQueryResponse.offset);
        const totalResults = getOrDefaultNumber(modelsQueryResponse.totalResults);
        return new PagedData<ModelResult>(data, offset, totalResults);
      });
  }

  /**
   * Determines if a model with the specified id is opened.
   *
   * @param id
   *   The id of the model to check.
   *
   * @returns
   *   True if the model is open, false otherwise.
   */
  public isOpen(id: string): boolean {
    Validation.assertNonEmptyString(id, "id");
    return this._openModels.has(id);
  }

  /**
   * Determines if a model with the specified ID is currently in the process
   * of being opened.
   *
   * @param id
   *   The id of the model to check.
   *
   * @returns
   *   True if the model is opening, false otherwise.
   */
  public isOpening(id: string): boolean {
    Validation.assertNonEmptyString(id, "id");
    return this._openModelRequests.has(id);
  }

  /**
   * Opens an existing model with a known model id. A model with the specified
   * id must already exist in the system.
   *
   * *Don't forget to [[RealTimeModel.close]] the model when you're done with it
   * to avoid memory leaks!*
   *
   * @param id
   *   The id of the model to open.
   *
   * @returns
   *   A promise that is resolved with the specified model, once open.
   */
  public open(id: string): Promise<RealTimeModel> {
    Validation.assertNonEmptyString(id, "id");
    return this._checkAndOpen(id);
  }

  /**
   * Opens a model, creating it if needed. If the model already exists, it will
   * be opened. If the model does not exist it will be created first, and then
   * opened.
   *
   * [See here](https://docs.convergence.io/guide/models/model-service.html#note-about-race-conditions)
   * for more context about race conditions this alleviates.
   *
   * @param options
   *   The options that define how to open and / or create the model.
   *
   * @returns
   *   A Promise resolved with the RealTimeModel, once opened.
   */
  public openAutoCreate(options: IAutoCreateModelOptions): Promise<RealTimeModel> {
    if (Validation.isNotSet(options)) {
      throw new ConvergenceError("'options' is a required parameter");
    }

    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<RealTimeModel>(new Error("options.collection must be a non-null, non empty string."));
    }

    return this._checkAndOpen(undefined, options);
  }

  /**
   * Creates a new model according to the options provided.  If a model with
   * the given ID already exists, this will return a rejected Promise.
   *
   * @param options
   *   A options object specifying how the model is to be created.
   *
   * @returns
   *   A Promise that is resolved with the id of the created model.
   */
  public create(options: ICreateModelOptions): Promise<string> {
    if (Validation.isNotSet(options)) {
      throw new ConvergenceError("'options' is a required parameter");
    }

    if (!Validation.nonEmptyString(options.collection)) {
      return Promise.reject<string>(new Error("options.collection must be a non-null, non empty string."));
    }

    return this._create(options);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _create(options: ICreateModelOptions, data?: ObjectValue): Promise<string> {
    const collection = options.collection;

    if (this._connection.isOnline()) {
      const userPermissions = modelUserPermissionMapToProto(options.userPermissions);
      const dataValue = data || this._getDataFromCreateOptions(options);
      const request: IConvergenceMessage = {
        createRealTimeModelRequest: {
          collectionId: collection,
          modelId: toOptional(options.id),
          data: toIObjectValue(dataValue),
          overrideWorldPermissions: options.overrideCollectionWorldPermissions,
          worldPermissions: options.worldPermissions,
          userPermissions
        }
      };

      return this._connection.request(request).then((response: IConvergenceMessage) => {
        const {createRealTimeModelResponse} = response;
        return createRealTimeModelResponse.modelId;
      });
    } else {
      const id = options.id || this._modelIdGenerator.nextString();
      return this._modelOfflineManager
        .getOfflineModelData(id)
        .then(modelState => {
          if (TypeChecker.isSet(modelState)) {
            return Promise.reject(new Error(`An offline model with the specified id already exists: ${id}`));
          } else {
            const dataValue = data || this._getDataFromCreateOptions(options);
            const creationData: IModelCreationData = {
              modelId: id,
              collection: options.collection,
              initialData: dataValue,
              overrideCollectionWorldPermissions: options.overrideCollectionWorldPermissions,
              worldPermissions: options.worldPermissions,
              userPermissions: options.userPermissions
            };
            return this._modelOfflineManager.createOfflineModel(creationData).then(() => id);
          }
        });
    }
  }

  /**
   * Removes an existing model by id.
   *
   * @param id
   *   The id of the model to remove.
   *
   * @returns
   *   A Promise that is resolved when the model is successfully removed.
   */
  public remove(id: string): Promise<void> {
    Validation.assertNonEmptyString(id, "id");

    const request: IConvergenceMessage = {
      deleteRealtimeModelRequest: {
        modelId: id
      }
    };

    if (this._connection.isOnline()) {
      return this._connection.request(request).then(() => {
        const model = this._openModels[id];
        const deletedEvent: ModelDeletedEvent = {
          src: model,
          name: RealTimeModel.Events.DELETED,
          local: true,
        };
        this._emitEvent(deletedEvent);
      });
    } else {
      // TODO delete the model offline, if it is local.
      throw new Error("Not implemented yet.");
    }
  }

  /**
   * Opens an existing model, by id, in [history mode](https://docs.convergence.io/guide/models/history.html).
   *
   * @param id
   *   The id of the model to open in history mode.
   *
   * @returns
   *   A Promise resolved with the [[HistoricalModel]] when opened.
   */
  public history(id: string): Promise<HistoricalModel> {
    Validation.assertNonEmptyString(id, "id");

    const request: IConvergenceMessage = {
      historicalDataRequest: {
        modelId: id
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {historicalDataResponse} = response;
      return new HistoricalModel(
        toObjectValue(historicalDataResponse.data),
        getOrDefaultNumber(historicalDataResponse.version),
        timestampToDate(historicalDataResponse.modifiedTime),
        timestampToDate(historicalDataResponse.createdTime),
        id,
        historicalDataResponse.collectionId,
        this._connection,
        this.session(),
        this._identityCache);
    });
  }

  /**
   * Gets the permissions manager for a specific model, by id. The permissions
   * manager will allow the caller to set the model permissions for the
   * specified model.
   *
   * @param id
   *   The id of an existing model to get the permissions manager for.
   *
   * @returns
   *   A permissions manager for the specified model.
   */
  public permissions(id: string): ModelPermissionManager {
    Validation.assertNonEmptyString(id, "id");
    return new ModelPermissionManager(id, this._connection);
  }

  /**
   * Adds a model or a list of models to the set of models that will be
   * proactively downloaded and made available offline. Note that duplicates
   * will simply be ignored.
   *
   * @param modelId
   *   A string or string array containing the unique ids of the models to
   *   be added to the current offline subscription list.
   *
   * @returns
   *   An empty Promise that will be resolved upon successful
   *   subscription.
   *
   * @experimental
   */
  public subscribeOffline(modelId: string | string[]): Promise<void> {
    const modelIds = TypeChecker.isArray(modelId) ? modelId : [modelId];
    return this._modelOfflineManager.subscribe(modelIds);
  }

  /**
   * Removes a model or a list of models to the set of models that will be
   * proactively downloaded and made available offline. If a model is
   * currently stored offline, and it is unsubscribed it will be purged
   * from the offline store.
   *
   * @param modelId
   *   A string or string array containing the unique ids of the models to
   *   be removed from the current offline subscription list.
   *
   * @returns
   *   An empty Promise that will be resolved upon successful
   *   unsubscription.
   *
   * @experimental
   */
  public unsubscribeOffline(modelId: string | string[]): Promise<void> {
    const modelIds = TypeChecker.isArray(modelId) ? modelId : [modelId];
    return this._modelOfflineManager.unsubscribe(modelIds);
  }

  /**
   * Sets the total set of models that will be proactively downloaded and
   * made available offline. Any models currently subscribed to that do
   * not appear in the supplied list of ids will be unsubscribe and
   * immediately removed from the offline store.
   *
   * @param modelIds
   *
   * @returns
   *   An empty Promise that will be resolved upon successful
   *   subscription.
   *
   * @experimental
   */
  public setOfflineSubscription(modelIds: string[]): Promise<void> {
    return this._modelOfflineManager.setSubscriptions(modelIds);
  }

  /**
   * Gets the list of model ids that are are currently subscribed to, to be
   * available offline.
   *
   * @returns The list of currently subscribed models.
   *
   * @experimental
   */
  public getOfflineSubscriptions(): Promise<string[]> {
    return this._modelOfflineManager.ready().then(() => this._modelOfflineManager.getSubscribedModelIds());
  }

  /**
   * Gets the meta data for all models currently stored offline.
   *
   * @returns The list of currently available offline models.
   *
   * @experimental
   */
  public getOfflineModelMetaData(): Promise<IModelMetaData[]> {
    return this._modelOfflineManager.ready().then(() => this._modelOfflineManager.getAllModelMetaData());
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _close(resourceId: string): void {
    if (this._resourceIdToModelId.has(resourceId)) {
      const modelId = this._resourceIdToModelId.get(resourceId);
      this._resourceIdToModelId.delete(resourceId);
      this._openModels.delete(modelId);

      if (this._resyncingModels.has(modelId)) {
        this._resyncComplete(modelId);
      }
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _resyncComplete(modelId: string): void {
    this._resyncingModels.delete(modelId);
    this._checkResyncQueue();
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _resourceIdChanged(modelId: string, oldResourceId: string, newResourceId: string): void {
    if (this._openModels.has(modelId) || this._resyncingModels.has(modelId)) {
      if (oldResourceId !== null) {
        this._resourceIdToModelId.delete(oldResourceId);
      }
      this._resourceIdToModelId.set(newResourceId, modelId);
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _dispose(): void {
    this._openModels.forEach(model => model
      .close()
      .catch(err => console.error(err)));
  }

  /**
   * @hidden
   * @internal
   */
  private _checkAndOpen(id?: string, options?: IAutoCreateModelOptions): Promise<RealTimeModel> {
    if (id === undefined && options === undefined) {
      throw new Error("Internal error, id or options must be defined.");
    }

    // TODO validate options, specifically the model initializer.

    if (TypeChecker.isNotSet(id)) {
      id = options.id;
    }

    // Opening by a known model id, and this model is already open.
    // return it.
    if (id && this._openModels.has(id)) {
      const model = this._openModels.get(id);
      if (model.isClosing()) {
        // Wait for the model to close, then open it.
        return model.whenClosed().then(() => this._open(id, options));
      } else {
        return Promise.resolve(model);
      }
    }

    // This model is already resyncing so we just return that and
    // let the model know to stay open after resync.
    if (this._resyncingModels.has(id)) {
      const model = this._resyncingModels.get(id);
      if (model.isClosing()) {
        return model.whenClosed().then(() => this._open(id, options));
      } else {
        model._openAfterResync();
        return Promise.resolve(model);
      }
    }

    // Opening by a known model id and we are already opening it.
    // return the promise for the open request.
    if (id && this._openModelRequests.has(id)) {
      return this._openModelRequests.get(id).promise();
    }

    // At this point we know we don't have the model open, or are not
    // already opening it, possible because we are creating a new model with
    // an new id.

    return this._open(id, options);
  }

  /**
   * @hidden
   * @internal
   */
  private _open(id?: string, options?: IAutoCreateModelOptions): Promise<RealTimeModel> {
    const autoRequestId: number = options ? this._autoRequestId++ : undefined;
    if (options !== undefined) {
      this._autoCreateRequests.set(autoRequestId, options);
    }

    const deferred: Deferred<RealTimeModel> = new Deferred<RealTimeModel>();

    // If we don't have an id 1) we can't have an initializer, and 2) we couldn't possibly
    // ask for this model again since we don't know what the id is until the promise returns.
    if (id !== undefined) {
      this._openModelRequests.set(id, deferred);
    }

    const open = this._connection.isOnline() ?
      this._openOnline(id, autoRequestId) :
      this._openOffline(id, autoRequestId);

    open.then(model => {
      this._clearOpenRecord(id, autoRequestId);
      this._openModels.set(model.modelId(), model);
    }).catch((error: Error) => {
      this._clearOpenRecord(id, autoRequestId);
      return Promise.reject(error);
    });

    deferred.resolveFromPromise(open);

    return deferred.promise();
  }

  /**
   * @hidden
   * @internal
   */
  private _clearOpenRecord(id: string, autoRequestId: number): void {
    if (id !== undefined !== undefined && this._openModelRequests.has(id)) {
      this._openModelRequests.delete(id);
    }

    if (autoRequestId !== undefined) {
      this._autoCreateRequests.delete(autoRequestId);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _openOnline(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    if (TypeChecker.isString(id)) {
      // The model is not already syncing. We see if it is one that needs
      // to be resynced.
      return this._modelOfflineManager.getModelDataIfDirty(id).then((modelState) => {
        if (TypeChecker.isUndefined(modelState)) {
          // Not a dirty model, se we can directly open from the server.
          return this._requestOpenFromServer(id, autoRequestId);
        } else {
          // This model has local changes, so open it locally and
          // start a resync.
          const index = this._modelResyncQueue.indexOf(id);
          if (index >= 0) {
            this._modelResyncQueue.splice(index, 1);
          }

          const model = this._createAndSyncModel(modelState);

          // Need to open it after the sync.
          model._openAfterResync();

          return Promise.resolve(model);
        }
      });
    } else {
      // We don't have an explicit id, thus this could not be an existing model
      // the might bee offline.
      return this._requestOpenFromServer(id, autoRequestId);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _requestOpenFromServer(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    const request: IConvergenceMessage = {
      openRealTimeModelRequest: {
        modelId: toOptional(id),
        autoCreateId: toOptional(autoRequestId)
      }
    };

    return this._connection.request(request)
      .then((response: IConvergenceMessage) => {
        const {openRealTimeModelResponse} = response;
        const data = toObjectValue(openRealTimeModelResponse.data);
        const model = this._createModel(
          getOrDefaultString(openRealTimeModelResponse.resourceId),
          getOrDefaultString(openRealTimeModelResponse.modelId),
          getOrDefaultString(openRealTimeModelResponse.collection),
          false,
          false,
          getOrDefaultNumber(openRealTimeModelResponse.version),
          timestampToDate(openRealTimeModelResponse.createdTime),
          timestampToDate(openRealTimeModelResponse.modifiedTime),
          getOrDefaultString(openRealTimeModelResponse.valueIdPrefix),
          getOrDefaultArray(openRealTimeModelResponse.connectedClients),
          getOrDefaultArray(openRealTimeModelResponse.resyncingClients),
          getOrDefaultArray(openRealTimeModelResponse.references),
          toModelPermissions(openRealTimeModelResponse.permissions),
          data
        );

        this._resourceIdToModelId.set(openRealTimeModelResponse.resourceId, model.modelId());
        return model;
      });
  }

  /**
   * @hidden
   * @internal
   */
  private _openOffline(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    if (TypeChecker.isUndefined(id)) {
      // todo we could generate an uuid just like the server.
      return Promise.reject(new Error("can not open an offline model without an id"));
    } else {
      return this._modelOfflineManager
        .getOfflineModelData(id)
        .then(modelState => {
          if (TypeChecker.isSet(modelState)) {
            const model = this._creteModelFromOfflineState(modelState, false);
            return Promise.resolve(model);
          } else if (this._autoCreateRequests.has(autoRequestId)) {
            const options = this._autoCreateRequests.get(autoRequestId);
            const model = this._createNewModelOffline(id, options);
            model._enableOffline();
            const snapshot = model._getModelStateSnapshot();
            const creationData: IModelCreationData = {
              modelId: id,
              collection: options.collection,
              initialData: snapshot.data,
              overrideCollectionWorldPermissions: options.overrideCollectionWorldPermissions,
              worldPermissions: options.worldPermissions,
              userPermissions: options.userPermissions
            };
            return this._modelOfflineManager.createOfflineModel(creationData).then(() => model);
          } else {
            return Promise.reject(new Error("Model not available offline, and not auto create options were provided"));
          }
        });
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _creteModelFromOfflineState(state: IModelState, resyncOnly: boolean): RealTimeModel {
    this._log.debug(`Creating model '${state.snapshot.modelId}' from offline state`);

    // FIXME what should these be?
    const resourceId = null;
    const valueIdPrefix = "fake2";

    // Note we initialize the model with the dataVersion. The rehydration
    // process will then take us to the current version.
    const model = this._createModel(
      resourceId,
      state.snapshot.modelId,
      state.snapshot.collection,
      state.snapshot.local,
      resyncOnly,
      state.snapshot.dataVersion,
      state.snapshot.createdTime,
      state.snapshot.modifiedTime,
      valueIdPrefix,
      [],
      [],
      [],
      state.snapshot.permissions,
      state.snapshot.data
    );

    model._setOffline();
    model._enableOffline();
    model._rehydrateFromOfflineState(state.version, state.serverOperations, state.localOperations);

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _createNewModelOffline(id: string, options: ICreateModelOptions): RealTimeModel {
    this._log.debug(`Creating new offline model model '${id}' using auto-create options.`);
    const dataValue = this._getDataFromCreateOptions(options);

    // FIXME what should these be?
    const resourceId = "fake";
    const valueIdPrefix = "fake2";
    const currentTime = new Date();
    const permissions = new ModelPermissions(true, true, true, true);
    const version = 1;
    const local = true;
    const resyncOnly = false;

    const model = this._createModel(
      resourceId,
      id,
      options.collection,
      local,
      resyncOnly,
      version,
      currentTime,
      currentTime,
      valueIdPrefix,
      [],
      [],
      [],
      permissions,
      dataValue
    );

    model._setOffline();

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _createModel(
    resourceId: string,
    modelId: string,
    collection: string,
    local: boolean,
    resyncModel: boolean,
    version: number,
    createdTime: Date,
    modifiedTime: Date,
    valueIdPrefix: string,
    connectedClients: string[],
    resyncingClients: string[],
    references: IReferenceData[],
    permissions: ModelPermissions,
    data: ObjectValue): RealTimeModel {

    const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
    const referenceTransformer: ReferenceTransformer =
      new ReferenceTransformer(new TransformationFunctionRegistry());
    const clientConcurrencyControl: ClientConcurrencyControl =
      new ClientConcurrencyControl(
        () => this._connection.session().sessionId(),
        version,
        transformer,
        referenceTransformer);

    return new RealTimeModel(
      resourceId,
      valueIdPrefix,
      data,
      local,
      resyncModel,
      connectedClients,
      resyncingClients,
      references,
      permissions,
      createdTime,
      modifiedTime,
      modelId,
      collection,
      clientConcurrencyControl,
      this._connection,
      this._identityCache,
      this,
      this._modelOfflineManager
    );
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;

    const resourceId: string = getModelMessageResourceId(message);

    if (resourceId) {
      const modelId = this._resourceIdToModelId.get(resourceId);
      const model: RealTimeModel = this._openModels.get(modelId) || this._resyncingModels.get(modelId);
      if (model !== undefined) {
        model._handleMessage(messageEvent);
      } else {
        this._log.warn("Received a message for a model that is not open: " + JSON.stringify(message));
      }
    } else if (message.modelAutoCreateConfigRequest) {
      this._handleModelDataRequest(
        message.modelAutoCreateConfigRequest,
        messageEvent.callback);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _handleModelDataRequest(request: IAutoCreateModelConfigRequestMessage, replyCallback: ReplyCallback): void {
    const autoCreateId = request.autoCreateId || 0;

    if (!this._autoCreateRequests.has(autoCreateId)) {
      const message = `Received a request for an auto create id that was not expected: ${autoCreateId}`;
      console.error(message);
      replyCallback.expectedError("unknown_model", message);
    } else {
      const options: IAutoCreateModelOptions = this._autoCreateRequests.get(autoCreateId);
      this._autoCreateRequests.delete(autoCreateId);

      const dataValue: ObjectValue = this._getDataFromCreateOptions(options);

      const userPermissions = modelUserPermissionMapToProto(options.userPermissions);
      const response: IConvergenceMessage = {
        modelAutoCreateConfigResponse: {
          data: toIObjectValue(dataValue),
          ephemeral: options.ephemeral,
          collection: options.collection,
          overridePermissions: options.overrideCollectionWorldPermissions,
          worldPermissions: options.worldPermissions,
          userPermissions
        }
      };
      replyCallback.reply(response);
    }
  }

  /**
   * @internal
   * @hidden
   */
  private _getDataFromCreateOptions(options: ICreateModelOptions): ObjectValue {
    let data: ModelDataInitializer = options.data;
    if (TypeChecker.isFunction(data)) {
      data = (data as ModelDataCallback)();
    } else if (TypeChecker.isNotSet(data)) {
      data = {};
    }

    // This makes sure that what we have is actually an object now.
    data = {...data};

    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
      return idGen.id();
    });
    return dataValueFactory.createDataValue(data) as ObjectValue;
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    this._openModels.forEach((model) => {
      model._setOnline();
      // The open models will automatically start to sync.
      this._resyncingModels.set(model.modelId(), model);
    });

    this._modelOfflineManager
      .ready()
      .then(() => this._syncDirtyModelsToServer())
      .then(() => {
        // We might have gone offline.
        if (this._connection.isOnline()) {
          return this._modelOfflineManager.resubscribe();
        } else {
          return Promise.resolve();
        }
      })
      .catch(e => console.error(e));
  }

  /**
   * @internal
   * @hidden
   */
  private async _syncDirtyModelsToServer(): Promise<void> {
    this._modelResyncQueue.length = 0;
    const dirtyModelIds = await this._modelOfflineManager.getDirtyModelIds();

    const noOpen = dirtyModelIds.filter(modelId => !this._resyncingModels.has(modelId));
    if (this._connection.isOnline()) {
      this._modelResyncQueue.push(...noOpen);
    }

    this._syncDeferred = new Deferred<void>();

    const promise = this._syncDeferred.promise();

    this._checkResyncQueue();

    return promise;
  }

  /**
   * @internal
   * @hidden
   */
  private _checkResyncQueue(): void {
    if (this._resyncingModels.size === 0) {
      // No models are currently syncing. If there are none in the queue
      // we are done. Else we start syncing the next one.
      if (this._modelResyncQueue.length === 0) {
        this._syncDeferred.resolve();
        this._syncDeferred = null;
        // TODO do we need to fire an event here?
      } else {
        const modelId = this._modelResyncQueue.pop();
        this._modelOfflineManager.getOfflineModelData(modelId).then(modelState => {
          // Here we make sure that some other process has not already initiated
          // a process that will sync the model anyway.
          if (TypeChecker.isSet(modelState) &&
            !this._resyncingModels.has(modelId) &&
            !this._openModels.has(modelId) &&
            !this._openModelRequests.has(modelId)) {
            this._createAndSyncModel(modelState);
          } else {
            // Try the next one.
            this._checkResyncQueue();
          }
        });
      }
    }
  }

  /**
   * @internal
   * @hidden
   */
  private _createAndSyncModel(modelState: IModelState): RealTimeModel {
    this._log.debug(`Synchronizing model: ${modelState.snapshot.modelId}`);

    const model = this._creteModelFromOfflineState(modelState, true);
    this._resyncingModels.set(model.modelId(), model);

    // The model will be in an offline state.  So we can actually trigger
    // it to go online which will do the normal sync process.
    model._setOnline();

    return model;
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._openModels.forEach((model) => {
      model._setOffline();
    });

    this._resourceIdToModelId.clear();
    this._resyncingModels.clear();
    this._modelResyncQueue.length = 0;

    if (this._syncDeferred !== null) {
      this._syncDeferred.resolve();
    }
  }
}

class InitialIdGenerator {
  private _prefix: string = "0";
  private _id: number = 0;

  public id(): string {
    return this._prefix + ":" + this._id++;
  }
}

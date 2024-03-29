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
import {IObjectValue} from "./dataValue";
import {DataValueFactory} from "./DataValueFactory";
import {ConvergenceError, ConvergenceEventEmitter, ConvergenceServerError, IConvergenceEvent} from "../util";
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
import {PagedData} from "../util/";
import {Validation} from "../util/Validation";
import {ModelOfflineManager} from "./ModelOfflineManager";
import {OfflineModelsSyncAbortedEvent, OfflineModelSyncErrorEvent} from "./events";
import {ModelPermissions} from "./ModelPermissions";
import {IModelCreationData, IModelMetaData, IModelState} from "../storage";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";
import {RandomStringGenerator} from "../util/RandomStringGenerator";
import {
  OfflineModelsSyncCompletedEvent,
  OfflineModelsSyncProgressEvent,
  OfflineModelsSyncStartedEvent,
  OfflineModelSyncCompletedEvent,
  OfflineModelSyncStartedEvent
} from "./events/";

import {com} from "@convergence/convergence-proto";
import {ErrorEvent} from "../events";
import {ReplayDeferred} from "../util/ReplayDeferred";
import {ConvergenceErrorCodes} from "../util/ConvergenceErrorCodes";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IAutoCreateModelConfigRequestMessage =
  com.convergencelabs.convergence.proto.model.IAutoCreateModelConfigRequestMessage;
import IReferenceData = com.convergencelabs.convergence.proto.model.IReferenceData;
import {DomainUserIdMap} from "../identity";

/**
 * The complete list of events that could be emitted by the [[ModelService]].
 *
 * @module Real Time Data
 */
export interface IModelServiceEvents {

  /**
   * Emitted local offline changes to models are being synchronized with the
   * server.
   *
   * The event emitted will be an [[OfflineModelSyncStartedEvent]].
   *
   * @event [[OfflineModelSyncStartedEvent]]
   */
  readonly OFFLINE_MODEL_SYNC_STARTED: "offline_model_sync_started";

  /**
   * Emitted when all local offline changes have been synchronized with the.
   * server.
   *
   * The event emitted will be an [[OfflineModelSyncCompletedEvent]]
   *
   * @event [[OfflineModelSyncCompletedEvent]]
   */
  readonly OFFLINE_MODEL_SYNC_COMPLETED: "offline_model_sync_completed";

  /**
   * Emitted a particular model encounters an error during the resync
   * process.
   *
   * The event emitted will be an [[OfflineModelSyncErrorEvent]]
   *
   * @event [[OfflineModelSyncErrorEvent]]
   */
  readonly OFFLINE_MODEL_SYNC_ERROR: "offline_model_sync_error";


  /**
   * Emitted when a model is initially downloaded after it was first subscribed
   * to offline.
   *
   * The event emitted will be an [[OfflineModelStatusChangedEvent]]
   *
   * @event [[OfflineModelStatusChangedEvent]]
   */
  readonly OFFLINE_MODEL_STATUS_CHANGED: "offline_model_status_changed";

  /**
   * Emitted whenever a model that is subscribed to offline is updated via the
   * periodic background synchronization process.
   *
   * The event emitted will be an [[OfflineModelUpdatedEvent]]
   *
   * @event [[OfflineModelUpdatedEvent]]
   */
  readonly OFFLINE_MODEL_UPDATED: "offline_model_updated";

  /**
   * Emitted when an already downloaded offline model is deleted.
   *
   * The event emitted will be an [[OfflineModelDeletedEvent]].
   *
   * @event [[OfflineModelDeletedEvent]]
   */
  readonly OFFLINE_MODEL_DELETED: "offline_model_deleted";

  /**
   * Emitted when an already downloaded offline model's permissions are
   * updated and the local user no longer has read permissions.
   *
   * The event emitted will be an [[OfflineModelPermissionsRevokedEvent]].
   *
   * @event [[OfflineModelPermissionsRevokedEvent]]
   */
  readonly OFFLINE_MODEL_PERMISSIONS_REVOKED: "offline_model_permissions_revoked";


  /**
   * Emitted whenever a change to the set of subscribed models results in new
   * models needing to be downloaded.
   *
   * The event emitted will be an [[OfflineModelsDownloadPendingEvent]].
   *
   * @event [[OfflineModelsDownloadPendingEvent]]
   */
  readonly OFFLINE_MODELS_DOWNLOAD_PENDING: "offline_models_download_pending";

  /**
   * Emitted when the number of models to download changes either because of
   * a successful download or a change to the subscription.
   *
   * The event emitted will be an [[OfflineModelsDownloadProgressEvent]]
   *
   * @event [[OfflineModelsDownloadProgressEvent]]
   */
  readonly OFFLINE_MODELS_DOWNLOAD_PROGRESS: "offline_models_download_progress";

  /**
   * Emitted when all models have been downloaded after a subscription change
   * that required additional models to be downloaded.
   *
   * The event emitted will be an [[OfflineModelsDownloadCompletedEvent]]
   *
   * @event [[OfflineModelsDownloadCompletedEvent]]
   */
  readonly OFFLINE_MODELS_DOWNLOAD_COMPLETED: "offline_models_download_completed";

  /**
   * Emitted when local offline changes to models are being synchronized with
   * the server.
   *
   * The event emitted will be an [[OfflineModelsSyncStartedEvent]].
   *
   * @event [[OfflineModelsSyncStartedEvent]]
   */
  readonly OFFLINE_MODELS_SYNC_STARTED: "offline_models_sync_started";

  /**
   * Emitted when the number of outstanding models to synchronize has
   * changed.
   *
   * The event emitted will be an [[OfflineModelsSyncProgressEvent]]
   *
   * @event [[OfflineModelsSyncProgressEvent]]
   */
  readonly OFFLINE_MODELS_SYNC_PROGRESS: "offline_models_sync_progress";

  /**
   * Emitted when all local offline changes have been synchronized with the.
   * server.
   *
   * The event emitted will be an [[OfflineModelsSyncCompletedEvent]]
   *
   * @event [[OfflineModelsSyncCompletedEvent]]
   */
  readonly OFFLINE_MODELS_SYNC_COMPLETED: "offline_models_sync_completed";

  /**
   * Emitted when the offline model synchronization process aborts.
   *
   * The event emitted will be an [[OfflineModelsSyncAbortedEvent]]
   *
   * @event [[OfflineModelsSyncAbortedEvent]]
   */
  readonly OFFLINE_MODELS_SYNC_ABORTED: "offline_models_sync_aborted";
}

/**
 * @module Real Time Data
 */
export const ModelServiceEventConstants: IModelServiceEvents = {
  OFFLINE_MODEL_SYNC_STARTED: "offline_model_sync_started",
  OFFLINE_MODEL_SYNC_COMPLETED: "offline_model_sync_completed",
  OFFLINE_MODEL_SYNC_ERROR: "offline_model_sync_error",

  OFFLINE_MODEL_STATUS_CHANGED: "offline_model_status_changed",
  OFFLINE_MODEL_UPDATED: "offline_model_updated",
  OFFLINE_MODEL_DELETED: "offline_model_deleted",
  OFFLINE_MODEL_PERMISSIONS_REVOKED: "offline_model_permissions_revoked",

  OFFLINE_MODELS_DOWNLOAD_PENDING: "offline_models_download_pending",
  OFFLINE_MODELS_DOWNLOAD_PROGRESS: "offline_models_download_progress",
  OFFLINE_MODELS_DOWNLOAD_COMPLETED: "offline_models_download_completed",

  OFFLINE_MODELS_SYNC_STARTED: "offline_models_sync_started",
  OFFLINE_MODELS_SYNC_PROGRESS: "offline_models_sync_progress",
  OFFLINE_MODELS_SYNC_COMPLETED: "offline_models_sync_completed",
  OFFLINE_MODELS_SYNC_ABORTED: "offline_models_sync_aborted",
};
Object.freeze(ModelServiceEventConstants);

/**
 * This is the main entry point in Convergence for working with
 * [real time data models](https://guide.convergence.io/models/overview.html).
 * [[RealTimeModel]]s can be created, opened, deleted, and managed from the [[ModelService]].
 *
 * See [[IModelServiceEvents]] for the events that may be emitted on this model.
 *
 * @module Real Time Data
 */
export class ModelService extends ConvergenceEventEmitter<IConvergenceEvent> {

  /**
   * A mapping of the events this model could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * modelService.on(ModelService.Events.OFFLINE_MODEL_DELETED, (e) => {
   *   // ...
   * })
   * ```
   *
   * See [[IModelServiceEvents]] for information on each event.
   */
  public static readonly Events: IModelServiceEvents = ModelServiceEventConstants;

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
  private readonly _resourceIdToModelId: Map<number, string> = new Map();

  /**
   * @internal
   */
  private readonly _resyncingModels: Map<string, IResyncEntry> = new Map();

  /**
   * @internal
   */
  private readonly _modelResyncQueue: IResyncEntry[];

  /**
   * @internal
   */
  private _syncCompletedDeferred: Deferred<void> | null;

  /**
   * @internal
   */
  private _offlineSyncStartedDeferred: ReplayDeferred<void> | null;

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
   * @internal
   */
  private readonly _undefinedObjectValues: "error" | "omit";

  /**
   * @internal
   */
  private readonly _undefinedArrayValues: "error" | "null"

  /**
   * @hidden
   * @internal
   */
  constructor(connection: ConvergenceConnection,
              identityCache: IdentityCache,
              modelOfflineManager: ModelOfflineManager,
              undefinedObjectValues: "error" | "omit",
              undefinedArrayValues: "error" | "null"
  ) {
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
    this._connection.on(ConvergenceConnection.Events.CONNECTED, this._setOnline);

    this._modelResyncQueue = [];

    this._syncCompletedDeferred = null;
    this._offlineSyncStartedDeferred = null;

    this._modelOfflineManager = modelOfflineManager;
    this._emitFrom(modelOfflineManager.events());

    this._undefinedArrayValues = undefinedArrayValues;
    this._undefinedObjectValues = undefinedObjectValues;

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

  public isResyncing(): boolean {
    return this._syncCompletedDeferred !== null;
  }

  /**
   * Searches for models using the model [query syntax](https://guide.convergence.io/models/queries.html).
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
   * [See here](https://guide.convergence.io/models/model-service.html#note-about-race-conditions)
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

    if (options.id === "") {
      throw new ConvergenceError("'options.id' can not be an empty string");
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

    return this._checkAndCreate(options);
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
  public async remove(id: string): Promise<void> {
    Validation.assertNonEmptyString(id, "id");

    if (this._offlineSyncStartedDeferred !== null) {
      // We are in the process of starting to sync. Wait for it to start.
      await this._offlineSyncStartedDeferred.promise();
    }

    if (this._resyncingModels.has(id)) {
      // This is a resyncing model.  Let it start resyncing.
      const entry = this._resyncingModels.get(id);

      if (entry.action === "delete") {
        return Promise.reject(
          new Error("The model has already been deleted locally and resynchronization is in process."));
      }

      if (entry.inProgress) {
        // If we are in progress we must wait for it to complete.
        this._log.debug(`Removing model "${id}" the is resynchronizing. Waiting for resynchronization to complete before removing`);
        await entry.done.promise();
      } else {
        // If we are not we change this from a resync to a delete.
        entry.action = "delete";
      }
    }

    if (this._openModels.get(id)) {
      // The model is open. Let's close it. Wait for it to close and then
      // delete it.
      const model = this._openModels.get(id);
      model._handleLocallyDeleted();
      await model.whenClosed();
    }

    if (this._modelOfflineManager.isOfflineEnabled()) {
      await this._modelOfflineManager
        .getModelMetaData(id)
        .then(meta => {
          if (meta) {
            return this._modelOfflineManager.markModelForDeletion(id);
          }
        })
        .catch(e => {
          this._log.error("Could not mark model for deletion", e);
        });
    }

    if (!this._connection.isConnected() && !this._modelOfflineManager.isOfflineEnabled()) {
      throw new ConvergenceError("Can not delete a model while not connected and without offline support enabled.");
    } else if (this._connection.isConnected()) {
      return this._removeOnline(id);
    }
  }

  /**
   * Opens an existing model, by id, in [history mode](https://guide.convergence.io/models/history.html).
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
  public async getOfflineSubscriptions(): Promise<string[]> {
    await this._modelOfflineManager.ready();
    const ids = await this._modelOfflineManager.getSubscribedModelIds();
    return Array.from(ids);
  }

  /**
   * Gets the meta data for all models currently stored offline.
   *
   * @returns The list of currently available offline models.
   *
   * @experimental
   */
  public async getOfflineModelMetaData(): Promise<IModelMetaData[]> {
    await this._modelOfflineManager.ready();
    return this._modelOfflineManager.getAllModelMetaData();
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public async _create(options: ICreateModelOptions, data?: IObjectValue): Promise<string> {
    const collection = options.collection;

    if (this._connection.isConnected()) {
      const userPermissions = modelUserPermissionMapToProto(
        options.userPermissions && DomainUserIdMap.of(options.userPermissions)
      );

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
    } else if (this._modelOfflineManager.isOfflineEnabled()) {
      const id = options.id || this._modelIdGenerator.nextString();

      const dataValue = data || this._getDataFromCreateOptions(options);
      const userPermissions = options.userPermissions &&
        DomainUserIdMap.of(options.userPermissions).toGuidObjectMap();

      const creationData: IModelCreationData = {
        modelId: id,
        collection: options.collection,
        initialData: dataValue,
        createdTime: new Date(),
        valueIdPrefix: "@",
        overrideCollectionWorldPermissions: options.overrideCollectionWorldPermissions,
        worldPermissions: options.worldPermissions,
        userPermissions
      };

      await this._modelOfflineManager.createOfflineModel(creationData);

      if (this._connection.isConnected()) {
        // we went online between when we started to create this model and now.
        // we need to see if we are still resyncing. If so, just add to the queue
        // else, we need to start another sync.
        const presentlySyncing = this._resyncingModels.size > 0 || this._modelResyncQueue.length > 0;

        this._addResyncModel(id, "resync");

        if (!presentlySyncing) {
          // Force a check of the resync queue. The one we just added should be the only
          // one there.
          this._checkResyncQueue();
        }
      }

      return id;
    } else {
      throw new ConvergenceError("Can not create a model while not connected and without offline support enabled.");
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _close(model: RealTimeModel): void {
    const modelId = model.modelId();
    this._log.debug("Model closed: " + model.modelId());

    if (this._openModels.has(modelId)) {
      this._openModels.delete(modelId);
    }

    const resourceId = model._getResourceId();
    if (resourceId !== null) {
      this._resourceIdToModelId.delete(resourceId);
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _resyncStarted(modelId: string, resourceId: number): void {
    this._registerResourceId(modelId, resourceId);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _resyncCompleted(modelId: string): void {
    this._emitEvent(new OfflineModelSyncCompletedEvent(modelId));
    this._log.debug(`Resync completed for model: "${modelId}"`);
    const entry = this._resyncingModels.get(modelId);
    entry.done.resolve();
    this._resyncingModels.delete(modelId);
    this._checkResyncQueue();
  }

  /**
   * @internal
   * @hidden
   */
  public _resyncError(modelId: string, message: string, model?: RealTimeModel): void {
    this._log.debug(`Resync error for model: "${modelId}"... ${message}`);
    const event = new OfflineModelSyncErrorEvent(modelId, message, model);
    this._emitEvent(event);

    const entry = this._resyncingModels.get(modelId);
    entry.ready.reject(new Error(message));

    this._resyncCompleted(modelId);
  }

  /**
   * @internal
   * @hidden
   */
  public _emitError(errorEvent: ErrorEvent): void {
    this._emitEvent(errorEvent);
    this._connection.session().domain()._emitError(errorEvent);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _dispose(): void {
    this._openModels.forEach(model => model
      .close()
      .catch(err => this._log.error(err)));
  }

  /**
   * @hidden
   * @internal
   */
  private _registerResourceId(modelId: string, resourceId: number): void {
    this._log.debug(`Registering resource id: {modelId: "${modelId}", resourceId: ${resourceId}}`);
    this._resourceIdToModelId.set(resourceId, modelId);
  }

  /**
   * @hidden
   * @internal
   */
  private async _checkAndOpen(id?: string, options?: IAutoCreateModelOptions): Promise<RealTimeModel> {
    // TODO validate options, specifically the model initializer.

    if (id === undefined && options === undefined) {
      throw new Error("Internal error, id or options must be defined.");
    }

    // We are in the process of starting to resync. Wait until that has started.
    if (this._offlineSyncStartedDeferred !== null) {
      await this._offlineSyncStartedDeferred.promise();
    }

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
        this._log.debug(`Opening model '${id}' that is already open`);
        return Promise.resolve(model);
      }
    }

    // Opening by a known model id and we are already opening it.
    // return the promise for the open request.
    if (id && this._openModelRequests.has(id)) {
      this._log.debug(`Opening model '${id}' that is already opening`);
      return this._openModelRequests.get(id).promise();
    }

    // This model is already resyncing so we just return that and
    // let the model know to stay open after resync.
    const resyncEntry = this._resyncingModels.get(id);
    if (resyncEntry && resyncEntry.resyncModel) {
      this._log.debug(`Opening model '${id}' that is resyncing`);
      if (resyncEntry.resyncModel.isClosing()) {
        return resyncEntry.resyncModel.whenClosed().then(() => this._open(id, options));
      } else {
        resyncEntry.resyncModel._openAfterResync();
        return Promise.resolve(resyncEntry.resyncModel);
      }
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

    let open: Promise<RealTimeModel>;

    if (this._connection.isConnected()) {
      open = this._openOnline(id, autoRequestId);
    } else if (this._modelOfflineManager.isOfflineEnabled()) {
      open = this._openOffline(id, autoRequestId);
    } else {
      open = Promise.reject(
        new ConvergenceError("Can not open a model while not online and without offline enabled."));
    }

    const result = open.then(model => {
      this._clearOpenRequestRecords(id, autoRequestId);
      this._openModels.set(model.modelId(), model);
      if (model._isOffline() && this._connection.isConnected()) {
        // in case this was an offline open, and we are now online. So
        // we start this model syncing.
        this._resyncOpenModel(model);
      }
      return model;
    }).catch((error: Error) => {
      this._clearOpenRequestRecords(id, autoRequestId);
      return Promise.reject(error);
    });

    deferred.resolveFromPromise(result);

    return deferred.promise();
  }

  /**
   * @hidden
   * @internal
   */
  private _resyncOpenModel(model: RealTimeModel): void {
    this._addResyncModel(model.modelId(), "resync", model);
    model._setOnline();
  }

  /**
   * @hidden
   * @internal
   */
  private _addResyncModel(modelId: string, action: "resync" | "delete", model?: RealTimeModel): void {
    const entry: IResyncEntry = {
      modelId,
      action,
      inProgress: model !== undefined,
      done: new ReplayDeferred<void>(),
      ready: model !== undefined ? ReplayDeferred.resolved() : new ReplayDeferred<void>(),
      resyncModel: model || null
    };

    this._resyncingModels.set(modelId, entry);
    if (!entry.inProgress) {
      this._modelResyncQueue.push(entry);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _clearOpenRequestRecords(id?: string, autoRequestId?: number): void {
    if (id !== undefined) {
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
    if (TypeChecker.isString(id) && this._modelOfflineManager.isOfflineEnabled()) {
      this._log.debug(`Opening model '${id}' while online`);
      return this._openOnlineWithOfflineEnabled(id, autoRequestId);
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
  private async _openOnlineWithOfflineEnabled(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    // See if this model is one that needs resyncing, we will move it up
    // to process now. It was already in the resyncingModels map, but
    // this will trigger it to process.
    const index = this._modelResyncQueue.findIndex(entry => entry.modelId === id);
    if (index >= 0) {
      // This model is one that needs to be resync'ed so we move it up.
      const [entry] = this._modelResyncQueue.splice(index, 1);
      await this._initiateModelResync(entry.modelId);
    }

    if (this._resyncingModels.has(id)) {
      const entry = this._resyncingModels.get(id);
      await entry.ready.promise();

      if (entry.action === "resync") {
        // We were doing a resync. The model must have been created at this point.
        return entry.resyncModel;
      } else {
        // This was a delete. It should have been deleted by now.
        this._requestOpenFromServer(id, autoRequestId);
      }
    } else {
      // not pending a resync so we can directly open from the server.
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
          getOrDefaultNumber(openRealTimeModelResponse.resourceId as number),
          getOrDefaultString(openRealTimeModelResponse.modelId),
          getOrDefaultString(openRealTimeModelResponse.collection),
          false,
          false,
          getOrDefaultNumber(openRealTimeModelResponse.version),
          0,
          timestampToDate(openRealTimeModelResponse.createdTime),
          timestampToDate(openRealTimeModelResponse.modifiedTime),
          getOrDefaultString(openRealTimeModelResponse.valueIdPrefix),
          getOrDefaultArray(openRealTimeModelResponse.connectedClients),
          getOrDefaultArray(openRealTimeModelResponse.resyncingClients),
          getOrDefaultArray(openRealTimeModelResponse.references),
          toModelPermissions(openRealTimeModelResponse.permissions),
          data
        );

        this._registerResourceId(model.modelId(), getOrDefaultNumber(openRealTimeModelResponse.resourceId));

        if (this._modelOfflineManager.isOfflineEnabled()) {
          return this._modelOfflineManager
            .storeOpenModelOffline(model)
            .then(() => {
              this._modelOfflineManager.modelOpened(model, 0);
              return model;
            });
        } else {
          return model;
        }
      });
  }

  /**
   * @hidden
   * @internal
   */
  private async _openOffline(id?: string, autoRequestId?: number): Promise<RealTimeModel> {
    if (TypeChecker.isUndefined(id)) {
      id = this._modelIdGenerator.nextString();
    }

    this._log.debug(`Opening model '${id}' while offline`);

    const modelState = await this._modelOfflineManager.getOfflineModelState(id);

    if (TypeChecker.isSet(modelState)) {
      const vidPrefix = await this._modelOfflineManager.claimValueIdPrefix(id);
      const model = this._creteModelFromOfflineState(modelState, vidPrefix, false);
      return Promise.resolve(model);
    } else if (this._autoCreateRequests.has(autoRequestId)) {
      const options = this._autoCreateRequests.get(autoRequestId);
      const model = this._createNewModelOffline(id, options);
      const snapshot = model._getConcurrencyControlStateSnapshot();
      const userPermissions = options.userPermissions &&
        DomainUserIdMap.of(options.userPermissions).toGuidObjectMap();
      const creationData: IModelCreationData = {
        modelId: id,
        collection: options.collection,
        initialData: snapshot.data,
        createdTime: new Date(),
        valueIdPrefix: "@",
        overrideCollectionWorldPermissions: options.overrideCollectionWorldPermissions,
        worldPermissions: options.worldPermissions,
        userPermissions
      };
      return this._modelOfflineManager.createOfflineModel(creationData).then(() => model);
    } else {
      return Promise.reject(new Error("Model not available offline, and not auto create options were provided"));
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _creteModelFromOfflineState(state: IModelState,
                                      valueIdPrefix: { prefix: string, increment: number },
                                      resyncOnly: boolean): RealTimeModel {
    this._log.debug(`Creating model '${state.modelId}' from offline state`);

    // This is initially null, which is fine. During reconnect it will be set
    // prior to messages being sent or received.
    const resourceId = null;

    // Note we initialize the model with the dataVersion. The rehydration
    // process will then take us to the current version.
    const model = this._createModel(
      resourceId,
      state.modelId,
      state.collection,
      state.local,
      resyncOnly,
      state.snapshot.version,
      state.snapshot.sequenceNumber,
      state.createdTime,
      state.modifiedTime,
      `${valueIdPrefix.prefix}-${valueIdPrefix.increment}`,
      [],
      [],
      [],
      state.permissions,
      state.snapshot.data
    );

    model._setOffline();
    model._rehydrateFromOfflineState(
      state.version,
      state.snapshot.serverOperations,
      state.snapshot.localOperations);

    const opsSinceSnapshot =
      (state.version - state.snapshot.version) + (state.lastSequenceNumber - state.snapshot.sequenceNumber);

    this._modelOfflineManager.modelOpened(model, opsSinceSnapshot);

    return model;
  }

  /**
   * @internal
   * @hidden
   */
  private _removeOnline(id: string): Promise<void> {
    this._log.debug(`Removing model online: "${id}"`);

    const request: IConvergenceMessage = {
      deleteRealtimeModelRequest: {
        modelId: id
      }
    };

    return this._connection
      .request(request)
      .then(() => {
        return this._handleOnlineDeletion(id);
      })
      .catch(e => {
        // We want to handle the delete as long as it wasn't a request timeout.
        // if it was a request timeout, then its possible the server did
        // not get our request.
        if (!(e instanceof ConvergenceError && e.code === ConvergenceErrorCodes.REQUEST_TIMEOUT)) {
          this._handleOnlineDeletion(id);
        }

        return Promise.reject(e);
      });
  }

  /**
   * @internal
   * @hidden
   */
  private _handleOnlineDeletion(id: string): Promise<void> {
    if (this._modelOfflineManager.isOfflineEnabled()) {
      return this._modelOfflineManager
        .getModelMetaData(id)
        .then(meta => {
          if (meta) {
            return this._modelOfflineManager.modelDeleted(id);
          }
        })
        .catch((e: Error) => {
          this._emitEvent(new ErrorEvent(
            this._connection.session().domain(),
            `There was an error removing the model with id '${id}' from the offline store: ${e.message}`)
          );
          this._log.error("Error removing model from offline store.", e);
        });
    } else {
      return Promise.resolve();
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _createNewModelOffline(id: string, options: ICreateModelOptions): RealTimeModel {
    this._log.debug(`Creating new offline model '${id}' using auto-create options.`);
    const dataValue = this._getDataFromCreateOptions(options);

    const resourceId = null;

    // 0 is a reserved value that will never be used by the server.
    const valueIdPrefix = "0";
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
      0,
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

    this._modelOfflineManager.modelOpened(model, 0);

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _createModel(
    resourceId: number,
    modelId: string,
    collection: string,
    local: boolean,
    resyncModel: boolean,
    version: number,
    sequenceNumber: number,
    createdTime: Date,
    modifiedTime: Date,
    valueIdPrefix: string,
    connectedClients: string[],
    resyncingClients: string[],
    references: IReferenceData[],
    permissions: ModelPermissions,
    data: IObjectValue): RealTimeModel {

    const transformer: OperationTransformer = new OperationTransformer(new TransformationFunctionRegistry());
    const referenceTransformer: ReferenceTransformer =
      new ReferenceTransformer(new TransformationFunctionRegistry());
    const clientConcurrencyControl: ClientConcurrencyControl =
      new ClientConcurrencyControl(
        () => this._connection.session().sessionId(),
        version,
        sequenceNumber,
        transformer,
        referenceTransformer);

    const model = new RealTimeModel(
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
      this._modelOfflineManager,
      this._undefinedObjectValues,
      this._undefinedArrayValues
    );

    return model;
  }

  /**
   * @hidden
   * @internal
   */
  private _handleMessage(messageEvent: MessageEvent): void {
    const message = messageEvent.message;

    // This method will return null if the message is not a model
    // message that contains a resource id.
    const resourceId: number | null = getModelMessageResourceId(message);

    if (resourceId !== null) {
      const model = this._getModelForResourceId(resourceId);
      if (model) {
        model._handleMessage(messageEvent);
      } else {
        this._log.warn(
          "Received a message for a model that is not open or resynchronizing: " + JSON.stringify(message));
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
  private _getModelForResourceId(resourceId: number): RealTimeModel | null {
    const modelId = this._resourceIdToModelId.get(resourceId);

    if (modelId === undefined) {
      return null;
    }

    const openModel = this._openModels.get(modelId);
    if (openModel !== undefined) {
      return openModel;
    }

    const resyncModel = this._resyncingModels.get(modelId);
    if (resyncModel !== undefined) {
      if (resyncModel.resyncModel) {
        return resyncModel.resyncModel;
      } else {
        this._log.warn("Received a message for model that is resyncing but not ready: " + modelId);
        return null;
      }
    }

    return null;
  }

  /**
   * @hidden
   * @internal
   */
  private _handleModelDataRequest(request: IAutoCreateModelConfigRequestMessage, replyCallback: ReplyCallback): void {
    const autoCreateId = request.autoCreateId || 0;

    if (!this._autoCreateRequests.has(autoCreateId)) {
      const message = `Received a request for an auto create id that was not expected: ${autoCreateId}`;
      this._log.error(message);
      replyCallback.expectedError("unknown_model", message);
    } else {
      const options: IAutoCreateModelOptions = this._autoCreateRequests.get(autoCreateId);
      this._autoCreateRequests.delete(autoCreateId);

      const dataValue: IObjectValue = this._getDataFromCreateOptions(options);

      const userPermissions = modelUserPermissionMapToProto(
        options.userPermissions && DomainUserIdMap.of(options.userPermissions)
      );

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
  private _getDataFromCreateOptions(options: ICreateModelOptions): IObjectValue {
    let data: ModelDataInitializer = options.data;
    if (TypeChecker.isFunction(data)) {
      data = (data as ModelDataCallback)();
    } else if (TypeChecker.isNotSet(data)) {
      data = {};
    }

    // This makes sure that what we have is actually an object now.
    data = {...data};

    const idGen: InitialIdGenerator = new InitialIdGenerator();
    const dataValueFactory: DataValueFactory = new DataValueFactory(
      () => idGen.id(),
      this._undefinedObjectValues,
      this._undefinedArrayValues);
    return dataValueFactory.createDataValue(data) as IObjectValue;
  }

  /**
   * @internal
   * @hidden
   */
  private _setOffline = () => {
    this._openModels.forEach((model) => {
      model._setOffline();
      if (this._resyncingModels.has(model.modelId())) {
        this._resyncingModels.delete(model.modelId());
      }
    });

    //  We need to go through the resync models and mark them offline.
    //  They are not going to be in the openModels list, and any that were
    //  handled above.
    this._resyncingModels.forEach(entry => {
      if (entry.resyncModel) {
        entry.resyncModel._setOffline();
        entry.resyncModel._initiateClose(false);
      }
    });

    this._resyncingModels.clear();
    this._modelResyncQueue.length = 0;

    if (this._offlineSyncStartedDeferred !== null) {
      this._offlineSyncStartedDeferred.resolve();
      this._offlineSyncStartedDeferred = null;
    }

    if (this._syncCompletedDeferred !== null) {
      this._emitEvent(new OfflineModelsSyncAbortedEvent("Convergence went offline during the sync", "offline"));
      this._syncCompletedDeferred.resolve();
      this._syncCompletedDeferred = null;
    }

    this._modelOfflineManager.setOffline();

    this._resourceIdToModelId.clear();

    this._checkResyncQueue();
  }

  /**
   * @internal
   * @hidden
   */
  private _setOnline = () => {
    // Even if offline is not enabled we will still sync open models.
    this._openModels.forEach((model) => {
      this._resyncOpenModel(model);
    });

    if (this._resyncingModels.size !== 0) {
      this._syncCompletedDeferred = new Deferred<void>();
    }

    if (this._modelOfflineManager.isOfflineEnabled()) {
      this._offlineSyncStartedDeferred = new ReplayDeferred<void>();
      this._modelOfflineManager
        .ready()
        .then(() => this._initiateOfflineModelSync())
        .catch((e) => this._log.error("Error resynchronizing models after reconnect", e));
    }
  }

  /**
   * @internal
   * @hidden
   */
  private async _initiateOfflineModelSync(): Promise<void> {
    if (this._connection.isConnected()) {
      await this._syncDirtyModelsToServer();
    }

    // We might have gone offline.
    if (this._connection.isConnected()) {
      await this._modelOfflineManager.setOnline();
    }
  }

  /**
   * @internal
   * @hidden
   */
  private async _syncDirtyModelsToServer(): Promise<void> {
    if (this._syncCompletedDeferred === null) {
      this._syncCompletedDeferred = new Deferred<void>();
    }

    const syncNeeded = await this._modelOfflineManager.getModelsRequiringSync();

    this._emitEvent(new OfflineModelsSyncStartedEvent(syncNeeded.length));

    // If the model is open, it already was going to be resyncing
    syncNeeded.forEach(metaData => {
      // If a model is already open, opening, or resyncing, then we
      // don't need to add it again because it will be handled.
      if (!this._openModels.has(metaData.modelId) &&
        !this._openModelRequests.has(metaData.modelId) &&
        !this._resyncingModels.has(metaData.modelId)) {
        this._addResyncModel(metaData.modelId, metaData.available ? "resync" : "delete");
      }
    });

    // The _checkResyncQueue queue could null out the
    // this._syncCompletedDeferred. So we want to grab
    // this now
    const promise = this._syncCompletedDeferred.promise();

    if (this._offlineSyncStartedDeferred !== null) {
      this._offlineSyncStartedDeferred.resolve();
      this._offlineSyncStartedDeferred = null;
    }

    this._checkResyncQueue();

    return promise;
  }

  /**
   * @internal
   * @hidden
   */
  private _checkResyncQueue(): void {
    if (!this._connection.isConnected()) {
      return;
    }

    // TODO we could optimize this by just keeping a list of in progress entries.
    const inProgress = Array.from(this._resyncingModels.values()).filter(m => m.inProgress);

    this._log.debug("Checking resync status");
    this._log.debug(() => {
      const modelIds = inProgress.map(e => e.modelId);
      return `In Progress Resync Models (${inProgress.length}): ${JSON.stringify(modelIds)}`;
    });
    this._log.debug(() => {
      const modelIds = this._modelResyncQueue.map(e => e.modelId);
      return `Queued Resync Models (${this._modelResyncQueue.length}): ${JSON.stringify(modelIds)}`;
    });

    if (this._offlineSyncStartedDeferred === null) {
      // We only want to emit progress events if we have actually started.
      this._emitEvent(new OfflineModelsSyncProgressEvent(inProgress.length + this._modelResyncQueue.length));
    }

    if (inProgress.length === 0) {
      // No models are currently syncing. If there are none in the queue
      // we are done. Else we start syncing the next one.
      if (this._modelResyncQueue.length === 0) {
        if (this._offlineSyncStartedDeferred !== null) {
          this._log.debug(`Resync queue is empty, but waiting for offline sync to start.`);
          // We might have sync'ed all of the open models, but we may not have
          // started on the offline ones yet.
          this._offlineSyncStartedDeferred.promise().then(() => this._checkResyncQueue());
        } else if (this._syncCompletedDeferred !== null) {
          this._log.debug(`Resync queue is empty, completing resync process`);
          this._emitEvent(new OfflineModelsSyncCompletedEvent());
          this._syncCompletedDeferred.resolve();
          this._syncCompletedDeferred = null;
        }
      } else {
        const entry = this._modelResyncQueue.pop();
        this._initiateModelResync(entry.modelId).catch((e) => {
          // No op here because this is handled in the method itself.
          this._log.error("Error resyncing models", e);
        });
      }
    }
  }

  /**
   * @hidden
   * @internal
   */
  private async _initiateModelResync(modelId: string): Promise<void> {
    this._log.debug(`Initiating sync for model: "${modelId}"`);
    const entry = this._resyncingModels.get(modelId);

    this._emitEvent(new OfflineModelSyncStartedEvent(entry.modelId));

    if (entry.action === "resync") {
      const modelState = await this._modelOfflineManager.getOfflineModelState(entry.modelId);

      // Here we make sure that some other process has not already initiated
      // a process that will sync the model anyway.
      if (TypeChecker.isSet(modelState)) {
        const prefix = await this._modelOfflineManager.claimValueIdPrefix(entry.modelId);
        const model = this._createAndSyncModel(modelState, prefix);
        entry.resyncModel = model;
        entry.ready.resolve();
      } else {
        const message = `The state for model "${modelId}" could not be found to resynchronize the model`;
        this._resyncError(modelId, message);
        return Promise.reject(new Error(message));
      }
    } else {
      return this._deleteResyncModel(entry.modelId)
        .then(() => entry.ready.resolve())
        .catch((e: Error) => {
          this._resyncError(modelId, e.message);
          return Promise.reject(new Error(e.message));
        });
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _deleteResyncModel(modelId: string): Promise<void> {
    this._log.debug(`Deleting resync model from the server: "${modelId}"`);
    return this._removeOnline(modelId)
      .then(() => this._resyncCompleted(modelId))
      .catch((e) => {
        if (e instanceof ConvergenceServerError && e.code === "model_not_found") {
          this._resyncCompleted(modelId);
          return Promise.resolve();
        } else {
          return Promise.reject(e);
        }
      });
  }

  /**
   * @internal
   * @hidden
   */
  private _createAndSyncModel(modelState: IModelState,
                              valueIdPrefix: { prefix: string, increment: number }): RealTimeModel {
    this._log.debug(`Creating and resynchronizing model: ${modelState.modelId}`);
    const model = this._creteModelFromOfflineState(modelState, valueIdPrefix, true);

    // The model will be in an offline state.  So we can actually trigger
    // it to go online which will do the normal sync process.
    model._setOnline();

    return model;
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  private async _checkAndCreate(options: ICreateModelOptions): Promise<string> {
    if (this._openModels.has(options.id)) {
      const message = `A model with id '${options.id}' is open locally.`;
      return Promise.reject(new ConvergenceError(message));
    }

    if (this._offlineSyncStartedDeferred !== null) {
      // We are in the process of starting to sync. Wait for it to start.
      await this._offlineSyncStartedDeferred.promise();
    }

    if (this._resyncingModels.has(options.id)) {
      const entry = this._resyncingModels.get(options.id);
      if (entry.action === "resync") {
        const message = `A model with id '${options.id}' is resynchronizing.`;
        return Promise.reject(new ConvergenceError(message));
      } else {
        // We are trying to delete an exiting one, let that happen first.
        await entry.ready;
      }
    }

    return this._create(options);
  }
}

class InitialIdGenerator {
  private _prefix: string = "@";
  private _id: number = 0;

  public id(): string {
    return this._prefix + ":" + this._id++;
  }
}

interface IResyncEntry {
  modelId: string;
  action: "resync" | "delete";
  done: ReplayDeferred<void>;
  inProgress: boolean;
  ready: ReplayDeferred<void>;
  resyncModel: RealTimeModel | null;
}

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

import {ConvergenceError, ConvergenceEventEmitter, IConvergenceEvent} from "../../util";
import {RealTimeObject} from "./RealTimeObject";
import {
  ElementReference,
  LocalElementReference,
  LocalModelReference,
  ModelReference,
  ModelReferenceCallbacks,
  ReferenceFilter
} from "../reference";
import {RealTimeElement} from "./RealTimeElement";
import {OnRemoteReference, ReferenceManager} from "../reference/ReferenceManager";
import {Model, ModelForcedCloseReasonCodes} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {ClientConcurrencyControl, ICommitStatusChanged} from "../ot/ClientConcurrencyControl";
import {ConvergenceConnection, MessageEvent} from "../../connection/ConvergenceConnection";
import {ModelService} from "../ModelService";
import {ModelReferenceData} from "../ot/xform/ReferenceTransformer";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ClientOperationEvent} from "../ot/ClientOperationEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ConvergenceSession} from "../../ConvergenceSession";
import {ServerOperationEvent} from "../ot/ServerOperationEvent";
import {Operation} from "../ot/ops/Operation";
import {OperationType} from "../ot/ops/OperationType";
import {CompoundOperation} from "../ot/ops/CompoundOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {
  CollaboratorClosedEvent,
  CollaboratorOpenedEvent,
  IModelEvent,
  ModelClosedEvent,
  ModelCommittedEvent,
  ModelDeletedEvent,
  ModelModifiedEvent,
  ModelOfflineEvent,
  ModelOnlineEvent,
  ModelPermissionsChangedEvent,
  ModelReconnectingEvent,
  RemoteReferenceCreatedEvent,
  RemoteResyncCompletedEvent,
  RemoteResyncStartedEvent,
  ResyncCompletedEvent,
  ResyncStartedEvent,
  VersionChangedEvent
} from "../events";
import {ModelCollaborator} from "./ModelCollaborator";
import {BehaviorSubject, Observable} from "rxjs";
import {ObservableModel, ObservableModelEventConstants, ObservableModelEvents} from "../observable/ObservableModel";
import {ModelPermissionManager} from "../ModelPermissionManager";
import {ModelPermissions} from "../ModelPermissions";
import {Path, PathElement} from "../Path";
import {IdentityCache} from "../../identity/IdentityCache";
import {toModelPermissions} from "../ModelMessageConverter";
import {
  fromOptional,
  getOrDefaultArray,
  getOrDefaultNumber,
  getOrDefaultString,
  timestampToDate,
  toOptional
} from "../../connection/ProtocolUtil";
import {toIOperationData, toOperation} from "../OperationMapper";
import {
  RemoteReferenceEvent,
  RemoteReferenceSet,
  RemoteReferenceShared,
  RemoteReferenceUnshared
} from "../reference/RemoteReferenceEvent";
import {extractValueAndType, toIReferenceValues, toRemoteReferenceEvent} from "../reference/ReferenceMessageUtils";
import {Logger} from "../../util/log/Logger";
import {Logging} from "../../util/log/Logging";
import {ModelOfflineManager} from "../ModelOfflineManager";
import {fromOfflineOperationData, toOfflineOperationData} from "../../storage/OfflineOperationMapper";
import {ILocalOperationData, IServerOperationData} from "../../storage/api";
import {DomainUser} from "../../identity";
import {ICreateModelOptions} from "../ICreateModelOptions";
import {IModelStateSnapshot} from "../IModeStateSnapshot";

import {com} from "@convergence/convergence-proto";
import IConvergenceMessage = com.convergencelabs.convergence.proto.IConvergenceMessage;
import IModelPermissionsChangedMessage = com.convergencelabs.convergence.proto.model.IModelPermissionsChangedMessage;
import IModelForceCloseMessage = com.convergencelabs.convergence.proto.model.IModelForceCloseMessage;
import IOperationAcknowledgementMessage = com.convergencelabs.convergence.proto.model.IOperationAcknowledgementMessage;
import IRemoteOperationMessage = com.convergencelabs.convergence.proto.model.IRemoteOperationMessage;
import IReferenceData = com.convergencelabs.convergence.proto.model.IReferenceData;
import IRemoteClientResyncStartedMessage =
  com.convergencelabs.convergence.proto.model.IRemoteClientResyncStartedMessage;
import IRemoteClientResyncCompletedMessage =
  com.convergencelabs.convergence.proto.model.IRemoteClientResyncCompletedMessage;

/**
 * The complete list of events that could be emitted by a [[RealTimeModel]].
 *
 * @module Real Time Data
 */
export interface RealTimeModelEvents extends ObservableModelEvents {
  /**
   * Emitted when the resync process begins.  This automatically happens
   * when a client becomes disconnected and accumulates local changes
   * that must be reconciled with the server.
   *
   * The actual event emitted is a [[ResyncStartedEvent]].
   *
   * @event [[ResyncStartedEvent]]
   */
  readonly RESYNC_STARTED: string;

  /**
   * Emitted when the resync process ends. The actual emitted event is a
   * [[ResyncCompletedEvent]].
   *
   * @event [[ResyncCompletedEvent]]
   */
  readonly RESYNC_COMPLETED: string;

  /**
   * Emitted when a remote client has started a resync . The actual emitted
   * event is a [[RemoteResyncStartedEvent]].
   *
   * @event [[RemoteResyncStartedEvent]]
   */
  readonly REMOTE_RESYNC_STARTED: string;

  /**
   * Emitted when a remote client has started a resync . The actual emitted
   * event is a [[RemoteResyncCompletedEvent]].
   *
   * @event [[RemoteResyncCompletedEvent]]
   */
  readonly REMOTE_RESYNC_COMPLETED: string;

  /**
   * Emitted when this model goes offline. The actual emitted event is a [[ModelOfflineEvent]].
   *
   * @event [[ModelOfflineEvent]]
   */
  readonly OFFLINE: string;

  /**
   * Emitted when this model comes back online after being offline.
   * The actual emitted event is a [[ModelOfflineEvent]].
   *
   * @event [[ModelOfflineEvent]]
   */
  readonly ONLINE: string;

  /**
   * Emitted when the model is attempting to reconnect to the server after
   * being offline. This only has to to with the connection; see
   * [[RESYNC_STARTED]] and [[RESYNC_COMPLETED]] for data reconciliation events.
   *
   * The actual emitted event is a [[ModelReconnectingEvent]].
   *
   * @event [[ModelReconnectingEvent]]
   */
  readonly RECONNECTING: string;

  /**
   * Emitted immediately when a local modification is made to a model.
   * The emitted event is an [[ModelModifiedEvent]].
   *
   * @event [[ModelModifiedEvent]]
   */
  readonly MODIFIED: string;

  /**
   * Emitted when the server acknowledges a local modification.  Note that
   * multiple modifications may be batched together into a single
   * `COMMITTED` response from the server.  See https://forum.convergence.io/t/behavior-of-model-version/16/4
   *
   * @event [[ModelCommittedEvent]]
   */
  readonly COMMITTED: string;

  /**
   * Emitted when another user opens this model. The actual event is a [[CollaboratorOpenedEvent]].
   *
   * @event [[CollaboratorOpenedEvent]]
   */
  readonly COLLABORATOR_OPENED: string;

  /**
   * Emitted when another user closes this model. The actual event is a [[CollaboratorClosedEvent]].
   *
   * @event [[CollaboratorClosedEvent]]
   */
  readonly COLLABORATOR_CLOSED: string;

  /**
   * Emitted when a [Remote Reference](https://docs.convergence.io/guide/models/references/remote-references.html)
   * is created on this model with [[RealTimeModel.elementReference]].
   *
   * The actual emitted event is a [[RemoteReferenceCreatedEvent]].
   *
   * @event [[RemoteReferenceCreatedEvent]]
   */
  readonly REFERENCE: string;

  /**
   * Emitted when the [permissions](https://docs.convergence.io/guide/models/permissions.html)
   * on this model change.  The actual emitted event is a [[ModelPermissionsChangedEvent]].
   *
   * @event [[ModelPermissionsChangedEvent]]
   */
  readonly PERMISSIONS_CHANGED: string;
}

const RealTimeModelEventConstants: RealTimeModelEvents = {
  ...ObservableModelEventConstants,
  MODIFIED: ModelModifiedEvent.NAME,
  COMMITTED: ModelCommittedEvent.NAME,
  RESYNC_STARTED: ResyncStartedEvent.NAME,
  RESYNC_COMPLETED: ResyncCompletedEvent.NAME,
  REMOTE_RESYNC_STARTED: RemoteResyncStartedEvent.NAME,
  REMOTE_RESYNC_COMPLETED: RemoteResyncCompletedEvent.NAME,
  OFFLINE: ModelOfflineEvent.NAME,
  ONLINE: ModelOnlineEvent.NAME,
  RECONNECTING: ModelReconnectingEvent.NAME,
  COLLABORATOR_OPENED: CollaboratorOpenedEvent.NAME,
  COLLABORATOR_CLOSED: CollaboratorClosedEvent.NAME,
  REFERENCE: RemoteReferenceCreatedEvent.NAME,
  PERMISSIONS_CHANGED: ModelPermissionsChangedEvent.NAME
};

/**
 * This is the core construct for dealing with distributed data in Convergence.
 * It is essentially a distributed data model: Anybody in the same domain with permissions
 * to this model can open it at the same time, be notified of remote changes, and modify
 * the data within, which is itself synchronized in the same way between all participants.
 * Any co-modification conflicts are resolved automatically and consistently
 * for all connected users so that everybody sees the same thing.
 *
 * See [this page](https://docs.convergence.io/guide/models/overview.html) in the
 * developer guide for a few of the interesting things you can do with a [[RealTimeModel]].
 *
 * Any data that can be represented with JSON can be stored in a [[RealTimeModel]].  This
 * allows a huge range of applications to sync data instantly and seamlessly with Convergence.
 *
 * To work with the data within (reading and writing):
 * * [[root]] to get the root object
 * * [[elementAt]] to query for a particular node within the data
 *
 * See [[RealTimeModelEvents]] for the events that may be emitted on this model.
 *
 * @module Real Time Data
 */
export class RealTimeModel extends ConvergenceEventEmitter<IConvergenceEvent> implements ObservableModel {

  /**
   * A mapping of the events this model could emit to each event's unique name.
   * Use this to refer an event name:
   *
   * ```typescript
   * rtModel.on(RealTimeModel.Events.COLLABORATOR_OPENED, function listener(e) {
   *   // ...
   * })
   * ```
   */
  public static readonly Events: RealTimeModelEvents = RealTimeModelEventConstants;

  /**
   * @internal
   */
  private static readonly _log: Logger = Logging.logger("models");

  /**
   * @internal
   */
  private _resourceId: string;

  /**
   * @internal
   */
  private _open: boolean;

  /**
   * @internal
   */
  private _committed: boolean;

  /**
   * @internal
   */
  private readonly _referencesBySession: Map<string, Array<ModelReference<any>>>;

  /**
   * @internal
   */
  private _sessions: string[];

  /**
   * @internal
   */
  private _resyncingSessions: string[];

  /**
   * @internal
   */
  private readonly _wrapperFactory: RealTimeWrapperFactory;

  /**
   * @internal
   */
  private readonly _referenceManager: ReferenceManager;

  /**
   * @internal
   */
  private readonly _callbacks: ModelEventCallbacks;

  /**
   * @internal
   */
  private readonly _model: Model;

  /**
   * @internal
   */
  private _emitLocal: boolean = false;

  /**
   * @internal
   */
  private _version: number;

  /**
   * @internal
   */
  private readonly _createdTime: Date;

  /**
   * @internal
   */
  private _time: Date;

  /**
   * @internal
   */
  private readonly _modelId: string;

  /**
   * @internal
   */
  private readonly _collectionId: string;

  /**
   * @internal
   */
  private _concurrencyControl: ClientConcurrencyControl;

  /**
   * @internal
   */
  private _connection: ConvergenceConnection;

  /**
   * @internal
   */
  private _modelService: ModelService;

  /**
   * @internal
   */
  private _permissions: ModelPermissions;

  /**
   * @internal
   */
  private readonly _collaboratorsSubject: BehaviorSubject<ModelCollaborator[]>;

  /**
   * @internal
   */
  private readonly _identityCache: IdentityCache;

  /**
   * @internal
   */
  private _resyncData: IResyncData | null;

  /**
   * @internal
   */
  private readonly _offlineManager: ModelOfflineManager;

  /**
   * @internal
   */
  private _storeOffline: boolean;

  /**
   * @internal
   */
  private _local: boolean;

  /**
   * @internal
   */
  private _resyncOnly: boolean;

  /**
   * @hidden
   * @internal
   *
   * Constructs a new RealTimeModel.
   */
  constructor(resourceId: string,
              valueIdPrefix: string,
              data: ObjectValue,
              local: boolean,
              resyncOnly: boolean,
              sessions: string[],
              resyncingSessions: string[],
              references: IReferenceData[],
              permissions: ModelPermissions,
              version: number,
              createdTime: Date,
              modifiedTime: Date,
              modelId: string,
              collectionId: string,
              concurrencyControl: ClientConcurrencyControl,
              connection: ConvergenceConnection,
              identityCache: IdentityCache,
              modelService: ModelService,
              modelOfflineManager: ModelOfflineManager) {
    super();

    this._resourceId = resourceId;
    this._version = version;
    this._local = local;
    this._createdTime = createdTime;
    this._time = modifiedTime;
    this._modelId = modelId;
    this._collectionId = collectionId;
    this._concurrencyControl = concurrencyControl;
    this._connection = connection;
    this._modelService = modelService;
    this._permissions = permissions;
    this._identityCache = identityCache;
    this._offlineManager = modelOfflineManager;
    this._resyncOnly = resyncOnly;

    this._resyncData = null;

    this._model = new Model(this.session(), valueIdPrefix, data);

    // we keep a map of all references by session so we can easily dispose of them
    // when a session disconnects.  It might be possible to do this by walking the
    // model as well.
    this._referencesBySession = new Map();
    this._sessions = [...sessions];

    this._resyncingSessions = [...resyncingSessions];

    this._collaboratorsSubject = new BehaviorSubject<ModelCollaborator[]>(this.collaborators());

    const onRemoteReference: OnRemoteReference = (ref) => this._onRemoteReferenceShared(ref);
    this._referenceManager = new ReferenceManager(
      this, [ModelReference.Types.ELEMENT], onRemoteReference, this._identityCache);

    this._concurrencyControl
      .on(ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED, (event: ICommitStatusChanged) => {
        this._committed = event.committed;
        const evt: IModelEvent = this._committed ?
          new ModelCommittedEvent(this) : new ModelModifiedEvent(this);
        this._emitEvent(evt);
      });

    const referenceCallbacks: ModelReferenceCallbacks = {
      onShare: this._onShareReference.bind(this),
      onUnShare: this._onUnshareReference.bind(this),
      onSet: this._onSetReference.bind(this),
      onClear: this._onClearReference.bind(this)
    };

    this._callbacks = {
      sendOperationCallback: (operation: DiscreteOperation): void => {
        const opEvent: ClientOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
        if (!this._concurrencyControl.isBatchOperationInProgress()) {
          this._handleLocalOperation(opEvent);
        }
      },
      referenceEventCallbacks: referenceCallbacks
    };

    this._wrapperFactory = new RealTimeWrapperFactory(this._callbacks, this, this._identityCache);

    this._open = true;
    this._committed = true;

    this._initializeReferences(references);

    this._offlineManager.modelOpened(this);
    this._storeOffline = this._offlineManager.isModelSubscribed(this._modelId);
  }

  /**
   * Returns the permissions the current user has on this model.
   */
  public permissions(): ModelPermissions {
    return this._permissions;
  }

  /**
   * Returns a permission manager that can be used to manage global or per-user
   * permissions on this model. Requires the `manage` permission.
   */
  public permissionsManager(): ModelPermissionManager {
    return new ModelPermissionManager(this._modelId, this._connection);
  }

  /**
   * The session associated with this opened model.
   */
  public session(): ConvergenceSession {
    return this._connection.session();
  }

  /**
   * Returns true if local changes to this model are being emitted.
   *
   * FIXME inconsistent with isOpen()
   */
  public emitLocalEvents(): boolean;

  /**
   * Toggles the `emitLocalEvents` setting.  If set to `true`, whenever any data
   * within this model is mutated, the same events will be emitted as if the mutation
   * happened remotely.  This is useful for handling change events in one place,
   * switching on the [[IConvergenceModelValueEvent]].local field.
   *
   * @param emit true if local changes to this model should emit
   */
  public emitLocalEvents(emit: boolean): void;
  public emitLocalEvents(emit?: boolean): any {
    if (arguments.length === 0) {
      return this._emitLocal;
    } else {
      this._emitLocal = emit;
      return;
    }
  }

  /**
   * Returns an array of collaborators, or other users who currently have this model
   * open.
   *
   * @returns an array of collaborators
   */
  public collaborators(): ModelCollaborator[] {
    return this._sessions.map((sessionId: string) => {
      const user = this._identityCache.getUserForSession(sessionId);
      return new ModelCollaborator(
        user,
        sessionId
      );
    });
  }

  /**
   * Returns an array of collaborators, or other users who currently have this model
   * open.
   *
   * @returns an array of collaborators
   */
  public resynchronizingCollaborators(): ModelCollaborator[] {
    return this._resyncingSessions.map((sessionId: string) => {
      const user = this._identityCache.getUserForSession(sessionId);
      return new ModelCollaborator(
        user,
        sessionId
      );
    });
  }

  /**
   * Returns an [observable](https://docs.convergence.io/guide/overview/events-and-observables.html)
   * which emits whenever a collaborator opens or closes this model.  This is useful
   * for keeping an up-to-date listing of current collaborators.
   *
   * Also see the [[PresenceService]] for a more robust mechanism for keeping tabs
   * on who is available for participation within the domain.
   */
  public collaboratorsAsObservable(): Observable<ModelCollaborator[]> {
    return this._collaboratorsSubject.asObservable();
  }

  /**
   * The collection ID to which this model belongs.
   */
  public collectionId(): string {
    return this._collectionId;
  }

  /**
   * This model's ID, unique in the Domain.
   */
  public modelId(): string {
    return this._modelId;
  }

  /**
   * The timestamp at which this model was last modified.
   */
  public time(): Date {
    return this._time;
  }

  /**
   * Alias of [[createdTime]]
   */
  public minTime(): Date {
    return this._createdTime;
  }

  /**
   * Alias of [[time]]
   */
  public maxTime(): Date {
    return this.time();
  }

  /**
   * The timestamp at which this model was first created.
   */
  public createdTime(): Date {
    return this._createdTime;
  }

  /**
   * The current version of the model.
   */
  public version(): number {
    return this._version;
  }

  /**
   * The first version of the model (`0`).
   */
  public minVersion(): number {
    return 0;
  }

  /**
   * Alias for [[version]]
   */
  public maxVersion(): number {
    return this.version();
  }

  /**
   * Returns a [[RealTimeObject]] wrapping the root node of this model's data.  From here
   * one can view or modify all or any part of the subtree at any level of granularity.
   */
  public root(): RealTimeObject {
    return this._wrapperFactory.wrap(this._model.root()) as RealTimeObject;
  }

  /**
   * Given a search path, returns the [[RealTimeElement]] at that path, or null if
   * no such element exists.
   *
   * @param path the search path for accessing a node within this model's data
   */
  public elementAt(path: Path): RealTimeElement<any>;

  /**
   * Given an array of search path elements, returns the [[RealTimeElement]] at
   * that path, or null if no such element exists.
   *
   * @param path an array of search path elements (which in totality are a [[Path]])
   */
  public elementAt(...path: PathElement[]): RealTimeElement<any>;
  public elementAt(...path: any[]): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(...path));
  }

  /**
   * Returns true if this model is currently open.
   */
  public isOpen(): boolean {
    return this._open;
  }

  /**
   * Closes the model, emitting the appropriate events to any other participants
   * and cleaning up any opened resources.
   */
  public close(): Promise<void> {
    if (this._open) {
      if (this._resyncData) {
        // We are resyncing, so we just need to set the flag
        // that we don't want to open.
        this._resyncOnly = true;
      } else {
        // We need to cache the connection here because the _close method sets it to null.
        const connection = this._connection;

        // Close the model and emit the appropriate events.
        const event: ModelClosedEvent = new ModelClosedEvent(this, true);
        this._close(event);

        // Inform the model service that we are closed.
        this._modelService._close(this._resourceId);

        // Inform the server that we are closed.
        const request: IConvergenceMessage = {
          closeRealTimeModelRequest: {
            resourceId: this._resourceId
          }
        };

        return connection
          .request(request)
          .then(() => {
            return Promise.resolve();
          })
          .catch(err => {
            console.warn(`Unexpected error closing a model: ${this._modelId}`, err);
            return Promise.resolve();
          });
      }
    } else {
      return Promise.reject(new ConvergenceError(`The model has already been closed: ${this._modelId}`));
    }
  }

  /**
   * Sets a flag on this model to indicate that any subsequent changes will be batched into
   * one atomic operation.  See [Batch Changes](https://docs.convergence.io/guide/models/batch-changes.html)
   * in the developer guide.
   *
   * Note that a single batch operation must be fully encompassed in a single JS
   * event loop ("tick").  This is to guarantee that no incoming events can conflict with
   * the batch job.
   */
  public startBatch(): void {
    this._concurrencyControl.startBatchOperation();
  }

  /**
   * Sends the batched operations to the server.
   *
   * Use [[completeBatch]] instead.
   */
  /** @deprecated */
  public endBatch(): void {
    this.completeBatch();
  }

  /**
   * Sends any accumulated model changes to the server as one atomic operation.
   * This also removes the batch flag such that subsequent individual changes are immediately
   * processed and sent as normal.
   */
  public completeBatch(): void {
    const opEvent: ClientOperationEvent = this._concurrencyControl.completeBatchOperation();
    this._handleLocalOperation(opEvent);
  }

  /**
   * Returns the number of model changes that have accumulated since [[startBatch]]
   * was called.
   */
  public batchSize(): number {
    return this._concurrencyControl.batchSize();
  }

  /**
   * Cancels the batch job.  Note that calling this once changes have occurred
   * on this model since the batch was started (that is, `batchSize() > 0`) will
   * result in an error.
   */
  public cancelBatch(): void {
    return this._concurrencyControl.cancelBatchOperation();
  }

  /**
   * Returns true if this model is currently in batch mode, that is, `startBatch`
   * was called and the batch was not completed or cancelled.
   *
   * @returns True if a batch is in progress, false otherwise.
   */
  public isBatchStarted(): boolean {
    return this._concurrencyControl.isBatchOperationInProgress();
  }

  /**
   * Creates an [Element Reference](https://docs.convergence.io/guide/models/references/realtimemodel.html),
   * which is a [Reference](https://docs.convergence.io/guide/models/references/references.html)
   * bound to one more [elements](#elementat) in this model's data.
   *
   * @param key a unique name for this ElementReference
   *
   * @returns An empty `LocalElementReference` which can then be bound to one or more elements.
   */
  public elementReference(key: string): LocalElementReference {
    const existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ModelReference.Types.ELEMENT) {
        throw new Error("A reference with this key already exists, but is not an observable reference");
      } else {
        return existing as LocalElementReference;
      }
    } else {
      const session: ConvergenceSession = this.session();
      const reference: ElementReference = new ElementReference(
        this._referenceManager, key, this, session.user(), session.sessionId(), true);

      const local: LocalElementReference = new LocalElementReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  /**
   * Returns the remote [[ModelReference]] created by the given `sessionId` with
   * the unique name `key`, or `undefined` if no such reference exists.
   *
   * See [Remote References](https://docs.convergence.io/guide/models/references/remote-references.html)
   * in the developer guide.
   *
   * @param sessionId The session ID that created the reference
   * @param key the reference's unique key
   *
   * @returns A model reference for thee specified sessionId and key.
   */
  public reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

  /**
   * Returns any remote references that match the given filter.  You can provide
   * a single `key` which could return references from multiple users, `sessionId`
   * which would return all of a particular user session's references, or both,
   * which is really just the same as using the [[reference]] method.
   *
   * @param filter an object containing either a `sessionId`, `key`, or both
   *
   * @returns An array of remote [[ModelReference]]s, or an empty array if there
   * were no matches.
   */
  public references(filter?: ReferenceFilter): Array<ModelReference<any>> {
    return this._referenceManager.getAll(filter);
  }

  /**
   * Marks this model to be available offline.
   */
  public subscribeOffline(): void {
    this._offlineManager.subscribe([this._modelId]);
  }

  /**
   * Marks this model no longer needs to be available offline.
   */
  public unsubscribeOffline(): void {
    this._offlineManager.unsubscribe([this._modelId]);
  }

  /**
   * Determines if this model is marked to be made available offline.
   *
   * @returns True if the model is marked for offline availability,
   *   false otherwise.
   */
  public isSubscribedOffline(): boolean {
    return this._offlineManager.isModelSubscribed(this._modelId);
  }

  //
  // Private API
  //

  /**
   * @private
   * @internal
   * @hidden
   */
  public _openAfterResync(): void {
    if (this._resyncData) {
      this._resyncOnly = false;
    }
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _isResyncOnly(): boolean {
    return this._resyncOnly;
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _getModelStateSnapshot(): IModelStateSnapshot {
    return {
      local: this._local,
      dirty: this._committed,
      seqNo: this._concurrencyControl.sequenceNumber(),
      data: this._model.root().dataValue()
    };
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _getUncommittedOperations(): ClientOperationEvent[] {
    return [...this._concurrencyControl.getInFlightOperations()];
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _enableOffline(): void {
    this._storeOffline = true;
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _disableOffline(): void {
    this._storeOffline = false;
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _rehydrateFromOfflineState(serverOps: IServerOperationData[], localOps: ILocalOperationData[]): void {
    const serverEvents = serverOps.map(serverOp => {
      const op = fromOfflineOperationData(serverOp.operation);
      return new ServerOperationEvent(
        serverOp.sessionId,
        serverOp.version,
        serverOp.timestamp,
        op
      );
    }).sort((a, b) => a.version - b.version);

    const clientEvents = localOps.map(localOp => {
      const op = fromOfflineOperationData(localOp.operation);
      return new ClientOperationEvent(
        localOp.sessionId,
        localOp.sequenceNumber,
        localOp.contextVersion,
        localOp.timestamp,
        op
      );
    }).sort((a, b) => {
      if (a.contextVersion === b.contextVersion) {
        return a.seqNo - b.seqNo;
      } else {
        return a.contextVersion - b.contextVersion;
      }
    });

    let contextVersion = this._concurrencyControl.contextVersion();
    let seqNo = this._concurrencyControl.sequenceNumber();
    let inFlight: ClientOperationEvent[] = [];
    while (serverEvents.length > 0 || clientEvents.length > 0) {
      while (serverEvents.length > 0 &&
      (clientEvents.length === 0 || serverEvents[0].version <= clientEvents[0].contextVersion)) {
        const serverEvent = serverEvents.shift();
        this._applyOperation(serverEvent.operation, serverEvent.clientId, serverEvent.version, serverEvent.timestamp);
        contextVersion++;
      }

      while (clientEvents.length > 0 && clientEvents[0].contextVersion === contextVersion) {
        const clientEvent = clientEvents.shift();
        this._applyOperation(
          clientEvent.operation,
          this._connection.session().sessionId(),
          clientEvent.contextVersion,
          clientEvent.timestamp);
        seqNo = clientEvent.seqNo + 1;
        inFlight.push(clientEvent);
      }
    }

    this._concurrencyControl.setState(contextVersion, seqNo, inFlight);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _getRegisteredValue(id: string): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._model._getRegisteredValue(id));
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleMessage(event: MessageEvent): void {
    const {
      forceCloseRealTimeModel,
      remoteOperation,
      referenceShared,
      referenceSet,
      referenceCleared,
      referenceUnshared,
      operationAck,
      remoteClientOpenedModel,
      remoteClientClosedModel,
      modelPermissionsChanged,
      remoteClientResyncStarted,
      remoteClientResyncCompleted,
    } = event.message;

    if (forceCloseRealTimeModel) {
      this._handleForceClose(forceCloseRealTimeModel);
    } else if (remoteOperation) {
      this._handleRemoteOperation(remoteOperation);
      this._emitVersionChanged();
    } else if (operationAck) {
      this._handelOperationAck(operationAck);
      this._emitVersionChanged();
    } else if (referenceShared || referenceSet || referenceCleared || referenceUnshared) {
      const remoteRefEvent = toRemoteReferenceEvent(event.message);
      this._handleRemoteReferenceEvent(remoteRefEvent);
    } else if (remoteClientOpenedModel) {
      this._handleClientOpen(getOrDefaultString(remoteClientOpenedModel.sessionId));
    } else if (remoteClientClosedModel) {
      this._handleClientClosed(getOrDefaultString(remoteClientClosedModel.sessionId));
    } else if (modelPermissionsChanged) {
      this._handleModelPermissionsChanged(modelPermissionsChanged);
    } else if (remoteClientResyncStarted) {
      this._handleRemoteClientResyncStarted(remoteClientResyncStarted);
    } else if (remoteClientResyncCompleted) {
      this._handleRemoteClientResyncCompleted(remoteClientResyncCompleted);
    } else {
      throw new Error("Unexpected message" + JSON.stringify(event.message));
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _setOffline(): void {
    RealTimeModel._log.debug(`model offline: ${this._modelId}`);
    this._emitEvent(new ModelOfflineEvent(this));

    this._sessions.forEach(sessionId => this._handleClientClosed(sessionId));

    this._sessions = [];

    this._resyncData = {
      bufferedOperations: [],
      upToDate: false
    };
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _setOnline(): void {
    if (this._local) {
      RealTimeModel._log.debug(`sending locally created model to the server: ${this._modelId}`);
      this._offlineManager.getModelCreationData(this._modelId).then(creation => {
        const options: ICreateModelOptions = {
          id: creation.modelId,
          collection: creation.collection,
          overrideCollectionWorldPermissions: creation.overrideCollectionWorldPermissions,
          worldPermissions: creation.worldPermissions,
          userPermissions: creation.userPermissions
        };
        return this._modelService._create(creation.initialData, options);
      }).then(() => {
        this._local = false;
        return this._offlineManager.modelCreated(this._modelId);
      }).then(() => {
        this._reconnect();
      }).catch(e => {
        RealTimeModel._log.error("Error creating offline model on reconnect.", e);
      });
    } else {
      this._reconnect();
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _reconnect(): void {
    RealTimeModel._log.debug(`remote model reconnecting: ${this._modelId}`);
    this._emitEvent(new ModelReconnectingEvent(this));

    const request: IConvergenceMessage = {
      modelResyncRequest: {
        modelId: this._modelId,
        contextVersion: this._concurrencyControl.contextVersion()
      }
    };

    this._connection.request(request).then((response: IConvergenceMessage) => {
      RealTimeModel._log.debug(`model resynchronization started: ${this._modelId}`);
      this._emitEvent(new ResyncStartedEvent(this));

      const {modelResyncResponse} = response;
      this._permissions = toModelPermissions(modelResyncResponse.permissions);
      this._resyncData.reconnectVersion = getOrDefaultNumber(modelResyncResponse.currentVersion) as number;
      const oldResourceId = this._resourceId;
      this._resourceId = getOrDefaultString(modelResyncResponse.resourceId);
      this._modelService._resourceIdChanged(this._modelId, oldResourceId, this._resourceId);
    });
  }

  /**
   * @hidden
   * @internal
   */
  private _handleModelPermissionsChanged(message: IModelPermissionsChangedMessage): void {
    const oldPermissions = this._permissions;
    this._permissions = toModelPermissions(message.permissions);

    const changes = [];
    if (this._permissions.read !== oldPermissions.read) {
      changes.push("read");
    }

    if (this._permissions.write !== oldPermissions.write) {
      changes.push("write");
    }

    if (this._permissions.remove !== oldPermissions.remove) {
      changes.push("remove");
    }

    if (this._permissions.manage !== oldPermissions.manage) {
      changes.push("manage");
    }

    const event = new ModelPermissionsChangedEvent(this, this._permissions, changes);
    this._emitEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleRemoteClientResyncStarted(message: IRemoteClientResyncStartedMessage): void {
    const sessionId = getOrDefaultString(message.sessionId);
    this._resyncingSessions.push(sessionId);
    const user = this._identityCache.getUserForSession(sessionId);
    const event = new RemoteResyncStartedEvent(this, sessionId, user);
    this._emitEvent(event);
  }

  /**
   * @hidden
   * @internal
   */
  private _handleRemoteClientResyncCompleted(message: IRemoteClientResyncCompletedMessage): void {
    const sessionId = getOrDefaultString(message.sessionId);
    this._resyncingSessions.push(sessionId);
    const index = this._resyncingSessions.indexOf(sessionId);
    if (index >= 0) {
      this._resyncingSessions.splice(index, 1);
    }
    const user = this._identityCache.getUserForSession(sessionId);
    const event = new RemoteResyncCompletedEvent(this, sessionId, user);
    this._emitEvent(event);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleClientOpen(sessionId: string): void {
    this._sessions.push(sessionId);
    this._referencesBySession.set(sessionId, []);

    const user = this._identityCache.getUserForSession(sessionId);
    const event: CollaboratorOpenedEvent = new CollaboratorOpenedEvent(
      this, new ModelCollaborator(user, sessionId));
    this._emitEvent(event);
    this._collaboratorsSubject.next(this.collaborators());
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleClientClosed(sessionId: string): void {
    this._sessions = this._sessions.filter(s => s !== sessionId);

    const refs: Array<ModelReference<any>> = this._referencesBySession.get(sessionId);
    this._referencesBySession.delete(sessionId);

    refs.forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });

    const user = this._identityCache.getUserForSession(sessionId);
    const event: CollaboratorClosedEvent = new CollaboratorClosedEvent(
      this, new ModelCollaborator(user, sessionId)
    );
    this._emitEvent(event);

    // todo we could make this more efficient by not calc'ing every time.
    this._collaboratorsSubject.next(this.collaborators());
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    if (event.valueId === null) {
      this._modelReferenceEvent(event);
    } else {
      const value: RealTimeElement<any> = this._getRegisteredValue(event.valueId);
      if (!value) {
        return;
      }

      if (event instanceof RemoteReferenceShared) {
        if (event.values) {
          let data: ModelReferenceData = {
            type: event.referenceType,
            valueId: event.valueId,
            values: event.values
          };
          data = this._concurrencyControl.processRemoteReferenceSet(data);
          event = new RemoteReferenceShared(
            event.sessionId,
            event.resourceId,
            event.valueId,
            event.key,
            event.referenceType,
            data.values
          );
        }
      } else if (event instanceof RemoteReferenceSet) {
        const reference = value.reference(event.sessionId, event.key);
        if (!reference) {
          console.warn("received an update for a non-existent reference.");
          return;
        }
        const type = reference.type();
        let data: ModelReferenceData = {
          type,
          valueId: event.valueId,
          values: event.values
        };
        data = this._concurrencyControl.processRemoteReferenceSet(data);
        event = new RemoteReferenceSet(
          event.sessionId,
          event.resourceId,
          event.valueId,
          event.key,
          data.values
        );
      }

      if (event instanceof RemoteReferenceUnshared) {
        const r: ModelReference<any> = value.reference(event.sessionId, event.key);
        const index: number = this._referencesBySession.get(event.sessionId).indexOf(r);
        this._referencesBySession.get(event.sessionId).splice(index, 1);
      }

      // TODO if we wind up being able to pause the processing of incoming
      //   operations, then we would put this in a queue.  We would also need
      //   to somehow wrap this in an object that stores the currentContext
      //   version right now, so we know when to distribute this event.
      value._handleRemoteReferenceEvent(event);

      if (event instanceof RemoteReferenceShared) {
        const r: ModelReference<any> = value.reference(event.sessionId, event.key);
        this._referencesBySession.get(event.sessionId).push(r);
      }
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleForceClose(message: IModelForceCloseMessage): void {
    console.error(`The model with id '${this._modelId}' was forcefully closed by the server: ${message.reason}`);

    const event: ModelClosedEvent = {
      src: this,
      name: RealTimeModel.Events.CLOSED,
      local: false,
      reason: message.reason
    };
    this._close(event);

    if (message.reasonCode === ModelForcedCloseReasonCodes.DELETED) {
      const deletedEvent: ModelDeletedEvent = {
        src: this,
        name: RealTimeModel.Events.DELETED,
        local: false,
        reason: message.reason
      };
      this._emitEvent(deletedEvent);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _close(event: ModelClosedEvent): void {
    this._offlineManager.modelClosed(this);
    this._model.root()._detach(false);
    this._open = false;
    this._connection = null;
    this._emitEvent(event);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handelOperationAck(message: IOperationAcknowledgementMessage): void {
    const version = getOrDefaultNumber(message.version);
    const sequenceNumber = getOrDefaultNumber(message.sequenceNumber);
    const acknowledgedOperation = this._concurrencyControl.processAcknowledgement(version, sequenceNumber);
    this._version = version + 1;
    this._time = timestampToDate(message.timestamp);

    if (this._storeOffline) {
      const operation = toOfflineOperationData(acknowledgedOperation.operation);

      const serverOp: IServerOperationData = {
        modelId: this._modelId,
        sessionId: this._connection.session().sessionId(),
        version,
        timestamp: this._time,
        operation
      };

      // fixme handle error.
      this._offlineManager
        .processOperationAck(this.modelId(), this._connection.session().sessionId(), sequenceNumber, serverOp)
        .catch(e => console.error(e));
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _handleRemoteOperation(message: IRemoteOperationMessage): void {
    // FIXME need sequenceNumber
    if (this._resyncData !== null) {
      if (getOrDefaultNumber(message.contextVersion) > this._resyncData.reconnectVersion) {
        // new message from a connected client buffer it because we don't have all
        // of the previous operations yet..
        this._resyncData.bufferedOperations.push(message);
      } else if (this._concurrencyControl.hasInflightOperation() &&
        this._concurrencyControl.firstInFlightOperation().sessionId === message.sessionId) {
        const syntheticAck = {
          resourceId: message.resourceId,
          version: message.contextVersion,
          timestamp: message.timestamp
        };
        this._handelOperationAck(syntheticAck);
        this._checkForReconnectUpToDate();
      } else {
        this._processRemoteOperation(message);
        this._checkForReconnectUpToDate();
      }
    } else {
      this._processRemoteOperation(message);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _processRemoteOperation(message: IRemoteOperationMessage): void {
    const unprocessed = new ServerOperationEvent(
      getOrDefaultString(message.sessionId),
      getOrDefaultNumber(message.contextVersion),
      timestampToDate(message.timestamp),
      toOperation(message.operation)
    );

    this._processServerOperationEvent(unprocessed);
  }

  private _processServerOperationEvent(unprocessed: ServerOperationEvent): void {
    this._concurrencyControl.processRemoteOperation(unprocessed);
    const processed: ServerOperationEvent = this._concurrencyControl.getNextIncomingOperation();

    const operation: Operation = processed.operation;
    const clientId: string = processed.clientId;
    const contextVersion: number = processed.version;
    const timestamp: Date = processed.timestamp;

    this._version = contextVersion + 1;
    this._time = new Date(timestamp);

    this._applyOperation(operation, clientId, contextVersion, timestamp);

    if (this._storeOffline) {
      const inflight = this._concurrencyControl.getInFlightOperations();
      this._offlineManager
        .processServerOperationEvent(this._modelId, processed, inflight)
        .catch(e => console.error(e));
      // FIXME handle this error
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _applyOperation(operation: Operation,
                          sessionId: string,
                          version: number,
                          timestamp: Date): void {
    const user = this._identityCache.getUserForSession(sessionId);

    if (operation.type === OperationType.COMPOUND) {
      const compoundOp: CompoundOperation = operation as CompoundOperation;
      compoundOp.ops.forEach((discreteOp: DiscreteOperation) => {
        this._applyDiscreteOperation(discreteOp, user, sessionId, version, timestamp);
      });
    } else {
      const discreteOp: DiscreteOperation = operation as DiscreteOperation;
      this._applyDiscreteOperation(discreteOp, user, sessionId, version, timestamp);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _applyDiscreteOperation(discreteOp: DiscreteOperation,
                                  user: DomainUser,
                                  sessionId: string,
                                  version: number,
                                  timestamp: Date): void {
    if (!discreteOp.noOp) {
      const modelEvent: ModelOperationEvent =
        new ModelOperationEvent(sessionId, user, version, timestamp, discreteOp);
      this._deliverToChild(modelEvent);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _checkForReconnectUpToDate(): void {
    if (this._resyncData &&
      !this._resyncData.upToDate &&
      this._resyncData.reconnectVersion === this._version) {
      this._resyncData.upToDate = true;
      // TODO when we get to offline mode we may have to rethink value id prefixes a bit
      //   two clients can not be re-initialized with the same vid prefix.

      this._concurrencyControl.resetSequenceNumber();

      const resend = this._concurrencyControl.getInFlightOperations();
      resend.forEach(op => this._sendOperation(op));

      // FIXME this could be heavy weight and block the UI a bit.
      this._resyncData.bufferedOperations.forEach(m => {
        this._processRemoteOperation(m);
      });

      RealTimeModel._log.debug(`model resynchronization completed: ${this._modelId}`);
      this._emitEvent(new ResyncCompletedEvent(this));

      const openAfterSync = !this._resyncOnly;

      const completeRequest: IConvergenceMessage = {
        modelResyncCompleteRequest: {
          resourceId: this._resourceId,
          open: openAfterSync
        }
      };

      this._modelService._resyncComplete(this._modelId);

      this._connection.request(completeRequest).then((response: IConvergenceMessage) => {
        const {modelResyncCompleteResponse} = response;

        if (openAfterSync) {
          const sessions = getOrDefaultArray(modelResyncCompleteResponse.connectedClients);
          sessions.forEach(sessionId => this._handleClientOpen(sessionId));

          this._initializeReferences(getOrDefaultArray(modelResyncCompleteResponse.references));

          this._resyncData = null;
          this._referenceManager.reshare();

          RealTimeModel._log.debug(`model online: ${this._modelId}`);
          this._emitEvent(new ModelOnlineEvent(this));
        }
      });

      if (!openAfterSync) {
        this._modelService._close(this._resourceId);
      }
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _deliverToChild(modelEvent: ModelOperationEvent): void {
    this._model.handleModelOperationEvent(modelEvent);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleLocalOperation(opEvent: ClientOperationEvent): void {
    if (this._storeOffline) {
      this._offlineManager.processLocalOperation(this._modelId, opEvent)
        .catch(e => RealTimeModel._log.error(`model persistence error: ${this._modelId}`, e));
    }
    this._sendOperation(opEvent);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _sendOperation(opEvent: ClientOperationEvent): void {
    if (this._sendEvents()) {
      const opSubmission: IConvergenceMessage = {
        operationSubmission: {
          resourceId: this._resourceId,
          sequenceNumber: opEvent.seqNo,
          contextVersion: opEvent.contextVersion,
          operation: toIOperationData(opEvent.operation)
        }
      };
      this._connection.send(opSubmission);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _emitVersionChanged(): void {
    const event = new VersionChangedEvent(this, this._version);
    this._emitEvent(event);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _modelReferenceEvent(message: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(message);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onRemoteReferenceShared(reference: ModelReference<any>): void {
    this._referencesBySession.get(reference.sessionId()).push(reference);
    this._emitEvent(new RemoteReferenceCreatedEvent(reference, this));
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _initializeReferences(references: IReferenceData[]): void {
    this._referencesBySession.clear();

    this._sessions.forEach(sessionId => {
      this._referencesBySession.set(sessionId, []);
    });

    references.forEach((ref: IReferenceData) => {
      let element: RealTimeElement<any>;
      const valueId = fromOptional<string>(ref.valueId);
      if (valueId !== null) {
        element = this._wrapperFactory.wrap(this._model._getRegisteredValue(valueId));
      }

      const {referenceType, values} = extractValueAndType(ref.reference);
      const shared = new RemoteReferenceShared(
        ref.sessionId,
        this._resourceId,
        valueId,
        ref.key,
        referenceType,
        values
      );

      if (element !== undefined) {
        element._handleRemoteReferenceEvent(shared);
        const r: ModelReference<any> = element.reference(ref.sessionId, ref.key);
        this._referencesBySession.get(ref.sessionId).push(r);
      } else {
        this._modelReferenceEvent(shared);
      }
    });
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onShareReference(reference: LocalModelReference<any, any>): void {
    if (this._sendEvents()) {
      const source: any = reference.reference().source();
      const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

      let refData: ModelReferenceData = {
        type: reference.reference().type(),
        valueId: vid,
        values: reference.reference().values()
      };

      // Only transform those that target a RealTimeElement
      if (vid !== undefined) {
        refData = this._concurrencyControl.processOutgoingSetReference(refData);
      }

      const event: IConvergenceMessage = {
        shareReference: {
          resourceId: this._resourceId,
          key: reference.reference().key(),
          valueId: toOptional(vid),
          references: toIReferenceValues(reference.reference().type(), refData.values),
          version: this._concurrencyControl.contextVersion()
        }
      };
      this._connection.send(event);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onUnshareReference(reference: LocalModelReference<any, any>): void {
    if (this._sendEvents()) {
      const source: any = reference.reference().source();
      const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

      const event: IConvergenceMessage = {
        unshareReference: {
          resourceId: this._resourceId,
          valueId: toOptional(vid),
          key: reference.reference().key(),
        }
      };
      this._connection.send(event);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onSetReference(reference: LocalModelReference<any, any>): void {
    if (this._sendEvents()) {
      const source: any = reference.reference().source();
      const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

      let refData: ModelReferenceData = {
        type: reference.reference().type(),
        valueId: vid,
        values: reference.reference().values()
      };

      // Only transform those that target a RealTimeElement
      if (vid !== undefined) {
        refData = this._concurrencyControl.processOutgoingSetReference(refData);
      }

      if (refData) {
        const event: IConvergenceMessage = {
          setReference: {
            resourceId: this._resourceId,
            key: reference.reference().key(),
            valueId: toOptional(refData.valueId),
            references: toIReferenceValues(reference.reference().type(), refData.values),
            version: this._concurrencyControl.contextVersion()
          }
        };
        this._connection.send(event);
      }
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onClearReference(reference: LocalModelReference<any, any>): void {
    if (this._sendEvents()) {
      const source: any = reference.reference().source();
      const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

      const event: IConvergenceMessage = {
        clearReference: {
          resourceId: this._resourceId,
          key: reference.reference().key(),
          valueId: toOptional(vid)
        }
      };
      this._connection.send(event);
    }
  }

  /**
   * @internal
   */
  private _sendEvents(): boolean {
    return this._connection.isOnline() && this._resyncData === null;
  }
}

Object.freeze(RealTimeModel.Events);

/**
 * @private
 * @hidden
 * @internal
 */
export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}

interface IResyncData {
  bufferedOperations: IRemoteOperationMessage[];
  reconnectVersion?: number;
  upToDate: boolean;
}
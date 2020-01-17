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
import {ModelEventCallbacks} from "../internal/ModelEventCallbacks";
import {IObjectValue} from "../dataValue";
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
  ResyncCompletedEvent, ResyncErrorEvent,
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
import {IConcurrencyControlState} from "../IModeStateSnapshot";
import {ReplayDeferred} from "../../util/ReplayDeferred";

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
import IModelResyncServerCompleteMessage =
  com.convergencelabs.convergence.proto.model.IModelResyncServerCompleteMessage;

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
   * Emitted when the resync process encounters an error. The actual event
   * is a [[ResyncErrorEvent]].
   *
   * @event [[ResyncErrorEvent]]
   */
  readonly RESYNC_ERROR: string;

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
  RESYNC_ERROR: ResyncErrorEvent.NAME,
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
  private readonly _log: Logger = Logging.logger("models");

  /**
   * @internal
   */
  private _resourceId: string | null;

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
   * @hidden
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
  private _offline: boolean;

  /**
   * @internal
   */
  private readonly _closingData: {
    deferred: ReplayDeferred<void>;
    closing: boolean;
    event?: ModelClosedEvent;
  };

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
  constructor(resourceId: string | null,
              valueIdPrefix: string,
              data: IObjectValue,
              local: boolean,
              resyncOnly: boolean,
              sessions: string[],
              resyncingSessions: string[],
              references: IReferenceData[],
              permissions: ModelPermissions,
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

    this._offline = false;
    this._resyncData = null;
    this._closingData = {
      deferred: new ReplayDeferred<void>(),
      closing: false
    };

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

    this._storeOffline = this._offlineManager.isOfflineEnabled();
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
    return this._concurrencyControl.contextVersion();
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
   * Determines if all local changes (if any) have been committed by the
   * server.
   *
   * @returns true if the model has no unacknowledged changes, false otherwise.
   */
  public isCommitted(): boolean {
    return this._concurrencyControl.isCommitted();
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
   * Determines is this model is a model that was created offline,
   * and has not been synced to the server yet.
   *
   * @returns
   *   True if the model was created locally and has not synced to the server,
   *   false otherwise.
   *
   * @experimental
   */
  public isLocal(): boolean {
    return this._local;
  }

  /**
   * Closes the model, emitting the appropriate events to any other participants
   * and cleaning up any opened resources.
   */
  public close(): Promise<void> {
    if (this._closingData.closing) {
      return Promise.reject(new ConvergenceError(`The model '${this._modelId}' is already closing`));
    }

    if (!this._open) {
      return Promise.reject(new ConvergenceError(`The model '${this._modelId}' has already been closed`));
    }

    if (this._resyncData !== null) {
      // We are resyncing, so we just need to set the flag
      // that we don't want to open.
      this._resyncOnly = true;
      return Promise.resolve();
    } else {
      // Close the model and emit the appropriate events.
      const event: ModelClosedEvent = new ModelClosedEvent(this, true);
      this._initiateClose(true, event);
      return this._closingData.deferred.promise();
    }
  }

  /**
   * Informs clients if the model is closing.
   *
   * @returns True if the model is closing.
   */
  public isClosing(): boolean {
    return this._closingData.closing || this._mustCloseAfterResync();
  }

  /**
   * @returns A promise the will be resolved when the model is closed. If
   * the model is already closed, the promise will be immediately resolved.
   */
  public whenClosed(): Promise<void> {
    return this._closingData.deferred.promise();
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
   *
   * @experimental
   */
  public subscribeOffline(): Promise<void> {
    return this._offlineManager.subscribe([this._modelId]);
  }

  /**
   * Marks this model no longer needs to be available offline.
   *
   * @experimental
   */
  public unsubscribeOffline(): Promise<void> {
    return this._offlineManager.unsubscribe([this._modelId]);
  }

  /**
   * Determines if this model is marked to be made available offline.
   *
   * @returns True if the model is marked for offline availability,
   *   false otherwise.
   *
   * @experimental
   */
  public isSubscribedOffline(): boolean {
    return this._offlineManager.isModelStoredOffline(this._modelId);
  }

  //
  // Private API
  //

  /**
   * @internal
   * @hidden
   * @private
   */
  public _getResourceId(): string | null {
    return this._resourceId;
  }

  /**
   * @internal
   * @hidden
   * @private
   */
  public _initiateClose(closeWithServer: boolean, event?: ModelClosedEvent): void {
    if (this._closingData.closing) {
      throw new ConvergenceError(`The model '${this._modelId}' is already closing.`, "already_closing");
    }

    this._debug("Initiating close");

    this._closingData.closing = true;
    this._closingData.event = event;

    if (this._connection.isOnline() && closeWithServer) {
      // Inform the server that we are closed.
      const request: IConvergenceMessage = {
        closeRealTimeModelRequest: {
          resourceId: this._resourceId
        }
      };

      this._connection
        .request(request)
        .then(() => {
          this._checkIfCanClose();
        })
        .catch(err => {
          this._log.error(`Unexpected error closing a model: ${this._modelId}`, err);
          this._closingData.deferred.reject(err);
        });
    } else {
      this._checkIfCanClose();
    }
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _valueIdPrefix(): string {
    return this._model.valueIdPrefix();
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _checkIfCanClose(): void {
    if (this._closingData.closing &&
      (this._concurrencyControl.isCommitted() || !this._connection.isOnline())) {
      this._close();
    }
  }

  /**
   * @private
   * @internal
   * @hidden
   */
  public _openAfterResync(): void {
    if (this._closingData.closing) {
      throw new ConvergenceError("Can't open after resynchronization if the mode is closing: " + this._modelId);
    }
    this._resyncOnly = false;
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
  public _getConcurrencyControlStateSnapshot(): IConcurrencyControlState {
    return {
      data: this._model.root().dataValue(),
      lastSequenceNumber: this._concurrencyControl.lastSequenceNumber(),
      uncommittedOperations: [...this._concurrencyControl.getInFlightOperations()]
    };
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _rehydrateFromOfflineState(targetVersion: number,
                                    serverOps: IServerOperationData[],
                                    localOps: ILocalOperationData[]): void {
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
    let lastSequenceNumber = this._concurrencyControl.lastSequenceNumber();
    let inFlight: ClientOperationEvent[] = [];

    // we may have client events that are older than the last sequence number.
    // this happens when we take a snapshot. Since the current snapshot already
    // contains thee effects of the operation, we can discard them.
    while (clientEvents.length > 0 && clientEvents[0].seqNo <= lastSequenceNumber) {
      clientEvents.shift();
    }

    const canApplyServerEvent = () => {
      return serverEvents.length > 0 &&
        (clientEvents.length === 0 || serverEvents[0].version <= clientEvents[0].contextVersion);
    };

    const canApplyClientEvent = () => {
      return clientEvents.length > 0 && clientEvents[0].contextVersion === contextVersion;
    };

    while (canApplyServerEvent() || canApplyClientEvent()) {
      while (canApplyServerEvent()) {
        const serverEvent = serverEvents.shift();
        this._applyOperation(serverEvent.operation, serverEvent.clientId, serverEvent.version, serverEvent.timestamp);
        contextVersion++;
      }

      while (canApplyClientEvent()) {
        const clientEvent = clientEvents.shift();
        this._applyOperation(
          clientEvent.operation,
          this._connection.session().sessionId(),
          clientEvent.contextVersion,
          clientEvent.timestamp);
        lastSequenceNumber = clientEvent.seqNo;
        inFlight.push(clientEvent);
      }
    }

    if (serverEvents.length > 0 || clientEvents.length > 0) {
      throw new Error(`Unable to apply all events while rehydrating model "${this._modelId}" from offline state.`);
    }

    if (contextVersion !== targetVersion) {
      throw new Error(
        `Did not arrive at the proper version (${targetVersion}) when rehydrating model: ${contextVersion}`);
    }

    this._concurrencyControl.setState(contextVersion, lastSequenceNumber, inFlight);
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
      modelResyncServerComplete
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
    } else if (modelResyncServerComplete) {
      this._handleModelResyncServerComplete(modelResyncServerComplete);
    } else {
      throw new Error("Unexpected message" + JSON.stringify(event.message));
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _isOffline(): boolean {
    return this._offline;
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _setOffline(): void {
    this._debug("Offline");

    this._offline = true;
    this._emitEvent(new ModelOfflineEvent(this));

    this._sessions.forEach(sessionId => this._handleClientClosed(sessionId));

    this._sessions = [];

    this._resyncData = null;

    this._resourceId = null;

    if (this._closingData.closing) {
      this._close();
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _setOnline(): void {
    this._offline = false;

    this._resyncData = {
      bufferedOperations: [],
      resyncCompleted: false,
      upToDate: false
    };

    if (this._local) {
      // If the model is not local, its possible that it was deleted offline
      // If it wasn't local and its open.. the that means the local user did not
      // deleted it and recreate it.  Thus we only need to check for deletion
      // if we are local.
      this._offlineManager.getModelMetaData(this._modelId).then(metaData => {
        if (metaData.deleted) {
          return this._modelService.remove(this._modelId)
            .catch((e) => {
              // TODO we should explicitly check for model_not_found and only
              //  ignore that.
              console.log(e);
            }).then(() => {
              return this._offlineManager.modelDeleted(this._modelId);
            });
        } else {
          return Promise.resolve();
        }
      }).then(() => {
        return this._offlineManager.getModelCreationData(this._modelId);
      }).then(creation => {
        this._debug("Creating offline model at the server");
        const options: ICreateModelOptions = {
          id: creation.modelId,
          collection: creation.collection,
          overrideCollectionWorldPermissions: creation.overrideCollectionWorldPermissions,
          worldPermissions: creation.worldPermissions,
          userPermissions: creation.userPermissions
        };
        return this._modelService._create(options, creation.initialData);
      }).then(() => {
        this._local = false;
        return this._offlineManager.modelCreated(this._modelId);
      }).then(() => {
        this._resynchronize();
      }).catch((e: Error) => {
        this._resyncError(e.message);
        this._log.error("Error synchronizing offline model on reconnect.", e);
      });
    } else {
      this._resynchronize();
    }
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _handleLocallyDeleted(): void {
    // Prevent the model from trying to store anything locally.
    this._storeOffline = false;

    const event = new ModelClosedEvent(this, true, "The model was locally deleted");
    this._initiateClose(true, event);

    const message = `The model '${this._modelId}' was locally deleted while offline.`;
    const deletedEvent = new ModelDeletedEvent(this, true, message);
    this._emitEvent(deletedEvent);
  }

  /**
   * @hidden
   * @internal
   */
  private _resynchronize(): void {
    this._debug("Requesting model resynchronization");
    this._emitEvent(new ModelReconnectingEvent(this));

    const request: IConvergenceMessage = {
      modelResyncRequest: {
        modelId: this._modelId,
        contextVersion: this._concurrencyControl.contextVersion()
      }
    };

    this._connection.request(request).then((response: IConvergenceMessage) => {
      this._debug("Starting model resynchronization");

      this._emitEvent(new ResyncStartedEvent(this));

      const {modelResyncResponse} = response;
      this._permissions = toModelPermissions(modelResyncResponse.permissions);
      this._resyncData.reconnectVersion = getOrDefaultNumber(modelResyncResponse.currentVersion) as number;
      this._resourceId = getOrDefaultString(modelResyncResponse.resourceId);

      this._modelService._resyncStarted(this._modelId, this._resourceId);

      // We do this because we might be up to date, version wise.
      this._checkForReconnectUpToDate();
    }).catch((e: Error) => this._resyncError(e.message));
  }

  /**
   * @hidden
   * @internal
   */
  private _resyncError(message: string): void {
    this._emitEvent(new ResyncErrorEvent(this, message));
    this._modelService._resyncError(this._modelId, message, this);
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
          this._log.warn("received an update for a non-existent reference.");
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
    if (this.isClosing()) {
      return;
    }

    const event = new ModelClosedEvent(this, false, message.reason);
    this._initiateClose(false, event);

    if (message.reasonCode === ModelForcedCloseReasonCodes.DELETED) {
      const deletedEvent = new ModelDeletedEvent(this, false, message.reason);
      this._emitEvent(deletedEvent);
    } else {
      this._log.error(`The model with id '${this._modelId}' was forcefully closed by the server: ${message.reason}`);
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _close(): void {
    const {deferred, event} = this._closingData;
    this._modelService._close(this);

    if (this._offlineManager.isOfflineEnabled()) {
      this._offlineManager.modelClosed(this);
    }

    this._model.root()._detach(false);
    this._open = false;
    this._connection = null;
    this._resourceId = null;

    this._closingData.closing = false;

    deferred.resolve();

    if (event) {
      this._emitEvent(event);
    }
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

      this._offlineManager
        .processOperationAck(this.modelId(), sequenceNumber, serverOp)
        .catch(e => {
          // FIXME handle error. Should we close the model? Just emit and error?
          this._log.error(e);
        });
    }

    // If we are closing and waiting for remote operations, we might be able to close.
    this._checkIfCanClose();
  }

  /**
   * @hidden
   * @internal
   */
  private _handleRemoteOperation(message: IRemoteOperationMessage): void {
    // FIXME need sequenceNumber
    if (this._resyncData !== null && !this._resyncData.upToDate) {
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

    this._time = new Date(timestamp);

    this._applyOperation(operation, clientId, contextVersion, timestamp);

    if (this._storeOffline) {
      const inflight = this._concurrencyControl.getInFlightOperations();
      this._offlineManager
        .processServerOperationEvent(this._modelId, processed, inflight)
        .catch(e => this._log.error(e));
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
    if (this._resyncData !== null &&
      !this._resyncData.upToDate &&
      this._resyncData.reconnectVersion === this._concurrencyControl.contextVersion()) {

      // TODO when we get to offline mode we may have to rethink value id prefixes a bit
      //   two clients can not be re-initialized with the same vid prefix.

      this._resyncData.upToDate = true;

      // FIXME this could be heavy weight and block the UI a bit.
      this._resyncData.bufferedOperations.forEach(m => {
        this._processRemoteOperation(m);
      });

      this._debug("All server operations applied during resynchronization");

      const resend = this._concurrencyControl.getInFlightOperations();
      resend.forEach(op => this._sendOperation(op));

      this._debug("All local operations resent during resynchronization");

      this._completeReconnect();
    }
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _completeReconnect(): void {
    this._debug("Requesting resynchronization completion");

    this._resyncData.resyncCompleted = true;
    this._resyncData.openAfterComplete = !this._resyncOnly;

    const completeRequest: IConvergenceMessage = {
      modelResyncClientComplete: {
        resourceId: this._resourceId,
        open: this._resyncData.openAfterComplete
      }
    };

    this._connection.send(completeRequest);
  }

  private _handleModelResyncServerComplete(message: IModelResyncServerCompleteMessage) {
    this._debug("Resynchronization completed");
    // We will be setting the reconnect data to null, so we need to
    // grab this now.
    const openAfterComplete = this._resyncData.openAfterComplete;

    // If we requested to stay open and we still need to be, open the model.
    // otherwise we will close id.
    const open = openAfterComplete && !this._resyncOnly;

    this._resyncData = null;
    this._emitEvent(new ResyncCompletedEvent(this));
    this._modelService._resyncCompleted(this._modelId);

    if (open) {
      this._debug("Opening after reconnect");
      const sessions = getOrDefaultArray(message.connectedClients);
      sessions.forEach(sessionId => this._handleClientOpen(sessionId));

      this._initializeReferences(getOrDefaultArray(message.references));

      this._referenceManager.reshare();

      this._debug(`Online`);
      this._emitEvent(new ModelOnlineEvent(this));
    } else {
      // we only need to close with the server if we requested it to be
      // open when we completed the reconnect
      this._initiateClose(openAfterComplete);
    }
  }

  /**
   * @hidden
   * @internal
   */
  private _mustCloseAfterResync(): boolean {
    return this._resyncData !== null &&
      this._resyncData.resyncCompleted &&
      !this._resyncData.openAfterComplete;
  }

  /**
   * @hidden
   * @internal
   */
  private _debug(message: string): void {
    this._log.debug(`Model("${this._modelId}"): ${message}`);
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
        .catch(e => this._log.error(`Error storing local operation: ${this._modelId}`, e));
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
    const event = new VersionChangedEvent(this, this._concurrencyControl.contextVersion());
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
    return this._connection.isOnline() &&
      !this._offline &&
      (this._resyncData === null || this._resyncData.upToDate);
  }
}

Object.freeze(RealTimeModel.Events);

interface IResyncData {
  bufferedOperations: IRemoteOperationMessage[];
  reconnectVersion?: number;
  upToDate: boolean;
  resyncCompleted: boolean;
  openAfterComplete?: boolean;
}

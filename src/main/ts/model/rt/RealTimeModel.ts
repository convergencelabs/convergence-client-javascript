import {ConvergenceError, ConvergenceEventEmitter} from "../../util";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/";
import {RealTimeElement} from "./RealTimeElement";
import {ReferenceManager, OnRemoteReference} from "../reference/ReferenceManager";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {ClientConcurrencyControl, ICommitStatusChanged} from "../ot/ClientConcurrencyControl";
import {ConvergenceConnection, MessageEvent} from "../../connection/ConvergenceConnection";
import {ModelService} from "../ModelService";
import {
  ModelReferenceCallbacks,
  LocalModelReference,
  LocalElementReference,
  ElementReference,
  ReferenceFilter
} from "../reference";
import {ModelReferenceData} from "../ot/xform/ReferenceTransformer";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {UnprocessedOperationEvent} from "../ot/UnprocessedOperationEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ConvergenceSession} from "../../ConvergenceSession";
import {ProcessedOperationEvent} from "../ot/ProcessedOperationEvent";
import {Operation} from "../ot/ops/Operation";
import {OperationType} from "../ot/ops/OperationType";
import {CompoundOperation} from "../ot/ops/CompoundOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {
  IModelEvent,
  ModelClosedEvent,
  VersionChangedEvent,
  RemoteReferenceCreatedEvent,
  ModelPermissionsChangedEvent
} from "../events/";
import {IConvergenceEvent} from "../../util/";
import {ModelCollaborator} from "./ModelCollaborator";
import {Observable, BehaviorSubject} from "rxjs";
import {ObservableModel, ObservableModelEvents, ObservableModelEventConstants} from "../observable/ObservableModel";
import {CollaboratorOpenedEvent, CollaboratorClosedEvent} from "./events";
import {ModelPermissionManager} from "../ModelPermissionManager";
import {ModelPermissions} from "../ModelPermissions";
import {Path, PathElement} from "../Path";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IModelPermissionsChangedMessage = io.convergence.proto.IModelPermissionsChangedMessage;
import {toModelPermissions} from "../ModelMessageConverter";
import IRemoteClientOpenedMessage = io.convergence.proto.IRemoteClientOpenedMessage;
import IRemoteClientClosedMessage = io.convergence.proto.IRemoteClientClosedMessage;
import {fromOptional, timestampToDate, toOptional} from "../../connection/ProtocolUtil";
import IModelForceCloseMessage = io.convergence.proto.IModelForceCloseMessage;
import IOperationAcknowledgementMessage = io.convergence.proto.IOperationAcknowledgementMessage;
import IRemoteOperationMessage = io.convergence.proto.IRemoteOperationMessage;
import {toIOperationData, toOperation} from "../OperationMapper";
import IReferenceData = io.convergence.proto.OpenRealtimeModelResponseMessage.IReferenceData;
import {
  RemoteReferenceEvent,
  RemoteReferenceSet,
  RemoteReferenceShared,
  RemoteReferenceUnshared
} from "../reference/RemoteReferenceEvent";
import {extractValueAndType, toIReferenceValues, toRemoteReferenceEvent} from "../reference/ReferenceMessageUtils";

export interface RealTimeModelEvents extends ObservableModelEvents {
  readonly MODIFIED: string;
  readonly COMMITTED: string;
  readonly COLLABORATOR_OPENED: string;
  readonly COLLABORATOR_CLOSED: string;
  readonly REFERENCE: string;
  readonly PERMISSIONS_CHANGED: string;
}

const RealTimeModelEventConstants: RealTimeModelEvents = {
  ...ObservableModelEventConstants,
  MODIFIED: "modified",
  COMMITTED: "committed",
  COLLABORATOR_OPENED: CollaboratorOpenedEvent.NAME,
  COLLABORATOR_CLOSED: CollaboratorClosedEvent.NAME,
  REFERENCE: RemoteReferenceCreatedEvent.NAME,
  PERMISSIONS_CHANGED: ModelPermissionsChangedEvent.NAME
};

export class RealTimeModel extends ConvergenceEventEmitter<IConvergenceEvent> implements ObservableModel {

  public static readonly Events: RealTimeModelEvents = RealTimeModelEventConstants;

  /**
   * @internal
   */
  private readonly _resourceId: string;

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
  private readonly _referencesBySession: { [key: string]: Array<ModelReference<any>> };

  /**
   * @internal
   */
  private _sessions: string[];

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
  private _model: Model;

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
  private _collaboratorsSubject: BehaviorSubject<ModelCollaborator[]>;

  /**
   * @hidden
   * @internal
   *
   * Constructs a new RealTimeModel.
   */
  constructor(resourceId: string,
              valueIdPrefix: string,
              data: ObjectValue,
              sessions: string[],
              references: IReferenceData[],
              permissions: ModelPermissions,
              version: number,
              createdTime: Date,
              modifiedTime: Date,
              modelId: string,
              collectionId: string,
              concurrencyControl: ClientConcurrencyControl,
              connection: ConvergenceConnection,
              modelService: ModelService) {
    super();

    this._resourceId = resourceId;
    this._version = version;
    this._createdTime = createdTime;
    this._time = modifiedTime;
    this._modelId = modelId;
    this._collectionId = collectionId;
    this._concurrencyControl = concurrencyControl;
    this._connection = connection;
    this._modelService = modelService;
    this._permissions = permissions;

    this._model = new Model(this.session().sessionId(), this.session().username(), valueIdPrefix, data);

    // we keep a map of all references by session so we can easily dispose of them
    // when a session disconnects.  It might be possible to do this by walking the
    // model as well.
    this._referencesBySession = {};
    this._sessions = sessions.slice(0);
    this._sessions.forEach((sessionId: string) => {
      this._referencesBySession[sessionId] = [];
    });

    this._collaboratorsSubject = new BehaviorSubject<ModelCollaborator[]>(this.collaborators());

    const onRemoteReference: OnRemoteReference = (ref) => this._onRemoteReferencePublished(ref);
    this._referenceManager = new ReferenceManager(this, [ModelReference.Types.ELEMENT], onRemoteReference);

    this._concurrencyControl
      .on(ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED, (event: ICommitStatusChanged) => {
        this._committed = event.committed;
        const name: string = this._committed ? RealTimeModel.Events.COMMITTED : RealTimeModel.Events.MODIFIED;
        const evt: IModelEvent = {src: this, name};
        this._emitEvent(evt);
      });

    const referenceCallbacks: ModelReferenceCallbacks = {
      onShare: this._onShareReference.bind(this),
      onUnshare: this._onUnshareReference.bind(this),
      onSet: this._onSetReference.bind(this),
      onClear: this._onClearReference.bind(this)
    };

    this._callbacks = {
      sendOperationCallback: (operation: DiscreteOperation): void => {
        const opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
        if (!this._concurrencyControl.isBatchOperationInProgress()) {
          this._sendOperation(opEvent);
        }
      },
      referenceEventCallbacks: referenceCallbacks
    };

    this._wrapperFactory = new RealTimeWrapperFactory(this._callbacks, this);

    this._open = true;
    this._committed = true;

    this._initializeReferences(references);
  }

  public permissions(): ModelPermissions {
    return this._permissions;
  }

  public permissionsManager(): ModelPermissionManager {
    return new ModelPermissionManager(this._modelId, this._connection);
  }

  public session(): ConvergenceSession {
    return this._connection.session();
  }

  // fixme inconsistent with isOpen()
  public emitLocalEvents(): boolean;
  public emitLocalEvents(emit: boolean): void;
  public emitLocalEvents(emit?: boolean): any {
    if (arguments.length === 0) {
      return this._emitLocal;
    } else {
      this._emitLocal = emit;
      return;
    }
  }

  public collaborators(): ModelCollaborator[] {
    return this._sessions.map((sessionId: string) => {
      // fixme username
      return new ModelCollaborator(
        "",
        sessionId
      );
    });
  }

  public collaboratorsAsObservable(): Observable<ModelCollaborator[]> {
    return this._collaboratorsSubject.asObservable();
  }

  public collectionId(): string {
    return this._collectionId;
  }

  public modelId(): string {
    return this._modelId;
  }

  public time(): Date {
    return this._time;
  }

  public minTime(): Date {
    return this._createdTime;
  }

  public maxTime(): Date {
    return this.time();
  }

  public createdTime(): Date {
    return this._createdTime;
  }

  public version(): number {
    return this._version;
  }

  public minVersion(): number {
    return 0;
  }

  public maxVersion(): number {
    return this.version();
  }

  public root(): RealTimeObject {
    return this._wrapperFactory.wrap(this._model.root()) as RealTimeObject;
  }

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;
  public elementAt(...path: any[]): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._model.valueAt(...path));
  }

  public isOpen(): boolean {
    return this._open;
  }

  public close(): Promise<void> {
    if (this._open) {
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
    } else {
      return Promise.reject(new ConvergenceError(`The model has already been closed: ${this._modelId}`));
    }
  }

  public startBatch(): void {
    this._concurrencyControl.startBatchOperation();
  }

  /** @deprecated */
  public endBatch(): void {
    this.completeBatch();
  }

  public completeBatch(): void {
    const opEvent: UnprocessedOperationEvent = this._concurrencyControl.completeBatchOperation();
    this._sendOperation(opEvent);
  }

  public batchSize(): number {
    return this._concurrencyControl.batchSize();
  }

  public cancelBatch(): void {
    return this._concurrencyControl.cancelBatchOperation();
  }

  public isBatchStarted(): boolean {
    return this._concurrencyControl.isBatchOperationInProgress();
  }

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
        this._referenceManager, key, this, session.username(), session.sessionId(), true);

      const local: LocalElementReference = new LocalElementReference(
        reference,
        this._callbacks.referenceEventCallbacks
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  public reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.get(sessionId, key);
  }

  public references(filter?: ReferenceFilter): Array<ModelReference<any>> {
    return this._referenceManager.getAll(filter);
  }

  //
  // Private API
  //

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
      modelPermissionsChanged
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
      this._handleClientOpen(remoteClientOpenedModel);
    } else if (remoteClientClosedModel) {
      this._handleClientClosed(remoteClientClosedModel);
    } else if (modelPermissionsChanged) {
      this._handleModelPermissionsChanged(modelPermissionsChanged);
    } else {
      throw new Error("Unexpected message" + JSON.stringify(event.message));
    }
  }

  /**
   * @private
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
   * @private
   * @hidden
   * @internal
   */
  private _handleClientOpen(message: IRemoteClientOpenedMessage): void {
    this._sessions.push(message.sessionId);
    this._referencesBySession[message.sessionId] = [];

    // fixme username
    const username = "";
    const event: CollaboratorOpenedEvent = new CollaboratorOpenedEvent(
      this, new ModelCollaborator(username, message.sessionId));
    this._emitEvent(event);
    this._collaboratorsSubject.next(this.collaborators());
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleClientClosed(message: IRemoteClientClosedMessage): void {
    this._sessions = this._sessions.filter(s => s !== message.sessionId);

    const refs: Array<ModelReference<any>> = this._referencesBySession[message.sessionId];
    delete this._referencesBySession[message.sessionId];

    refs.forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });

    // fixme username
    const username = "";
    const event: CollaboratorClosedEvent = new CollaboratorClosedEvent(
      this, new ModelCollaborator(username, message.sessionId)
    );
    this._emitEvent(event);

    // todo we could make this more performant by not calc'ing every time.
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
        // todo validate that the reference exists.
        const type = this.reference(event.sessionId, event.valueId).type();
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

      let r: ModelReference<any>;

      if (event instanceof RemoteReferenceUnshared) {
        r = value.reference(event.sessionId, event.key);
        const index: number = this._referencesBySession[event.sessionId].indexOf(r);
        this._referencesBySession[event.sessionId].splice(index, 1);
      }

      // TODO if we wind up being able to pause the processing of incoming
      // operations, then we would put this in a queue.  We would also need
      // to somehow wrap this in an object that stores the currentContext
      // version right now, so we know when to distribute this event.
      value._handleRemoteReferenceEvent(event);

      if (event instanceof RemoteReferenceShared) {
        r = value.reference(event.sessionId, event.key);
        this._referencesBySession[event.sessionId].push(r);
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
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _close(event: ModelClosedEvent): void {
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
    // todo in theory we could pass the operation in to verify it as well.
    const version = message.version as number;
    this._concurrencyControl.processAcknowledgementOperation(message.seqNo, version);
    this._version = version + 1;
    this._time = timestampToDate(message.timestamp);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _handleRemoteOperation(message: IRemoteOperationMessage): void {

    const unprocessed: UnprocessedOperationEvent = new UnprocessedOperationEvent(
      message.sessionId,
      -1, // fixme not needed, this is only needed when going to the server.  Perhaps
      // this should probably go in the op submission message.
      message.contextVersion as number,
      timestampToDate(message.timestamp),
      toOperation(message.operation)
    );

    this._concurrencyControl.processRemoteOperation(unprocessed);
    const processed: ProcessedOperationEvent = this._concurrencyControl.getNextIncomingOperation();

    const operation: Operation = processed.operation;
    const clientId: string = processed.clientId;
    const contextVersion: number = processed.version;
    const timestamp: Date = processed.timestamp;

    // fixme username
    const username = "";
    this._version = contextVersion + 1;
    this._time = new Date(timestamp);

    if (operation.type === OperationType.COMPOUND) {
      const compoundOp: CompoundOperation = operation as CompoundOperation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        if (!op.noOp) {
          const modelEvent: ModelOperationEvent =
            new ModelOperationEvent(clientId, username, contextVersion, timestamp, op);
          this._deliverToChild(modelEvent);
        }
      });
    } else {
      const discreteOp: DiscreteOperation = operation as DiscreteOperation;
      if (!discreteOp.noOp) {
        const modelEvent: ModelOperationEvent =
          new ModelOperationEvent(clientId, username, contextVersion, timestamp, discreteOp);
        this._deliverToChild(modelEvent);
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
  private _sendOperation(opEvent: UnprocessedOperationEvent): void {
    const opSubmission: IConvergenceMessage = {
      operationSubmission: {
        resourceId: this._resourceId,
        sequenceNumber: opEvent.seqNo,
        version: opEvent.contextVersion,
        operation: toIOperationData(opEvent.operation)
      }
    };
    this._connection.send(opSubmission);
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
  private _onRemoteReferencePublished(reference: ModelReference<any>): void {
    this._referencesBySession[reference.sessionId()].push(reference);
    this._emitEvent(new RemoteReferenceCreatedEvent(reference, this));
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _initializeReferences(references: IReferenceData[]): void {
    references.forEach((ref: IReferenceData) => {
      let element: RealTimeElement<any>;
      const valueId = fromOptional(ref.valueId);
      if (valueId !== null) {
        element = this._wrapperFactory.wrap(this._model._getRegisteredValue(valueId));
      }

      const {referenceType, values} = extractValueAndType(ref.reference);
      const published = new RemoteReferenceShared(
        ref.sessionId,
        this._resourceId,
        valueId,
        ref.key,
        referenceType,
        values
      );

      if (element !== undefined) {
        element._handleRemoteReferenceEvent(published);
        const r: ModelReference<any> = element.reference(ref.sessionId, ref.key);
        this._referencesBySession[ref.sessionId].push(r);
      } else {
        this._modelReferenceEvent(published);
      }

      // Fixme we used to do this, but the publish can contain the values, so
      // why would we need to do this also?
      // if (ref.values) {
      //   const set: IConvergenceMessage = {
      //     referenceSet: {
      //       sessionId: ref.sessionId,
      //       resourceId: this._resourceId,
      //       key: ref.key,
      //       valueId: ref.id,
      //       referenceType: ref.referenceType,
      //       values: ref.values
      //     }
      //   };
      //
      //   if (model !== undefined) {
      //     model._handleRemoteReferenceEvent(set);
      //   } else {
      //     this._modelReferenceEvent(set);
      //   }
      // }
    });
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onShareReference(reference: LocalModelReference<any, any>): void {
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

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onUnshareReference(reference: LocalModelReference<any, any>): void {
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

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onSetReference(reference: LocalModelReference<any, any>): void {
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

  /**
   * @private
   * @hidden
   * @internal
   */
  private _onClearReference(reference: LocalModelReference<any, any>): void {
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

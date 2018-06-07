import {ConvergenceEventEmitter} from "../../util";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/";
import {RealTimeElement} from "./RealTimeElement";
import {ReferenceManager, OnRemoteReference} from "../reference/ReferenceManager";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {ReferenceData} from "../../connection/protocol/model/openRealtimeModel";
import {ClientConcurrencyControl} from "../ot/ClientConcurrencyControl";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {ModelService} from "../ModelService";
import {ModelReferenceCallbacks} from "../reference";
import {LocalModelReference} from "../reference";
import {PublishReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {MessageType} from "../../connection/protocol/MessageType";
import {UnpublishReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelReferenceData} from "../ot/xform/ReferenceTransformer";
import {SetReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ClearReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {UnprocessedOperationEvent} from "../ot/UnprocessedOperationEvent";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {RemoteReferencePublished} from "../../connection/protocol/model/reference/ReferenceEvent";
import {SessionIdParser} from "../../connection/protocol/SessionIdParser";
import {RemoteReferenceSet} from "../../connection/protocol/model/reference/ReferenceEvent";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/";
import {ElementReference} from "../reference/";
import {ReferenceFilter} from "../reference/";
import {ForceCloseRealTimeModel} from "../../connection/protocol/model/forceCloseRealtimeModel";
import {RemoteOperation} from "../../connection/protocol/model/remoteOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {OperationAck} from "../../connection/protocol/model/operationAck";
import {RemoteClientOpenedModel} from "../../connection/protocol/model/remoteOpenClose";
import {RemoteClientClosedModel} from "../../connection/protocol/model/remoteOpenClose";
import {Immutable} from "../../util/Immutable";
import {ProcessedOperationEvent} from "../ot/ProcessedOperationEvent";
import {Operation} from "../ot/ops/Operation";
import {OperationType} from "../ot/ops/OperationType";
import {CompoundOperation} from "../ot/ops/CompoundOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationSubmission} from "../../connection/protocol/model/operationSubmission";
import {MessageEvent} from "../../connection/ConvergenceConnection";
import {RemoteReferenceCreatedEvent, ModelPermissionsChangedEvent} from "../modelEvents";
import {ModelEvent} from "../modelEvents";
import {ModelClosedEvent} from "../modelEvents";
import {VersionChangedEvent} from "../modelEvents";
import {ConvergenceEvent} from "../../util/";
import {ModelCollaborator} from "./ModelCollaborator";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ObservableModel, ObservableModelEvents, ObservableModelEventConstants} from "../observable/ObservableModel";
import {CollaboratorOpenedEvent, CollaboratorClosedEvent} from "./events";
import {ModelPermissionManager} from "../ModelPermissionManager";
import {ModelPermissions} from "../ModelPermissions";
import {ModelPermissionsChanged} from "../../connection/protocol/model/permissions/modelPermissionsChanged";
import {Path, PathElement} from "../Path";

export interface RealTimeModelEvents extends ObservableModelEvents {
  readonly MODIFIED: string;
  readonly COMMITTED: string;
  readonly COLLABORATOR_OPENED: string;
  readonly COLLABORATOR_CLOSED: string;
  readonly REFERENCE: string;
  readonly PERMISSIONS_CHANGED: string;
}

const RealTimeModelEventConstants: RealTimeModelEvents = Object.assign({
    MODIFIED: "modified",
    COMMITTED: "committed",
    COLLABORATOR_OPENED: CollaboratorOpenedEvent.NAME,
    COLLABORATOR_CLOSED: CollaboratorClosedEvent.NAME,
    REFERENCE: RemoteReferenceCreatedEvent.NAME,
    PERMISSIONS_CHANGED: ModelPermissionsChangedEvent.NAME
  },
  ObservableModelEventConstants);

export class RealTimeModel extends ConvergenceEventEmitter<ConvergenceEvent> implements ObservableModel {

  public static readonly Events: RealTimeModelEvents = RealTimeModelEventConstants;

  private _resourceId: string;

  private _open: boolean;
  private _committed: boolean;
  private _referencesBySession: {[key: string]: Array<ModelReference<any>>};
  private _sessions: string[];
  private _wrapperFactory: RealTimeWrapperFactory;

  private _referenceManager: ReferenceManager;
  private _callbacks: ModelEventCallbacks;

  private _model: Model;
  private _emitLocal: boolean = false;

  private _version: number;
  private _createdTime: Date;
  private _time: Date;
  private _modelId: string;
  private _collectionId: string;
  private _concurrencyControl: ClientConcurrencyControl;
  private _connection: ConvergenceConnection;
  private _modelService: ModelService;
  private _permissions: ModelPermissions;

  private _collaboratorsSubject: BehaviorSubject<ModelCollaborator[]>;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(resourceId: string,
              valueIdPrefix: string,
              data: ObjectValue,
              sessions: string[],
              references: ReferenceData[],
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

    this._concurrencyControl.on(ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED, (committed: boolean) => {
      this._committed = committed;
      const name: string = this._committed ? RealTimeModel.Events.COMMITTED : RealTimeModel.Events.MODIFIED;
      const evt: ModelEvent = {src: this, name};
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

  public session(): Session {
    return this._connection.session();
  }

  // fixme inconsistent with isOpen()
  public emitLocalEvents(): boolean
  public emitLocalEvents(emit: boolean): void
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
      return new ModelCollaborator(
        SessionIdParser.parseUsername(sessionId),
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
    return <RealTimeObject> this._wrapperFactory.wrap(this._model.root());
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
    return this._modelService._close(this._resourceId).then(() => {
      const event: ModelClosedEvent = {
        src: this,
        name: RealTimeModel.Events.CLOSED,
        local: true
      };
      this._close(event);
    });
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
        return <LocalElementReference> existing;
      }
    } else {
      const session: Session = this.session();
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

  public _getRegisteredValue(id: string): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._model._getRegisteredValue(id));
  }

  public _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        this._handleForceClose(<ForceCloseRealTimeModel> messageEvent.message);
        break;
      case MessageType.REMOTE_OPERATION:
        this._handleRemoteOperation(<RemoteOperation> messageEvent.message);
        this._emitVersionChanged();
        break;
      case MessageType.REFERENCE_PUBLISHED:
      case MessageType.REFERENCE_UNPUBLISHED:
      case MessageType.REFERENCE_SET:
      case MessageType.REFERENCE_CLEARED:
        this._handleRemoteReferenceEvent(<RemoteReferenceEvent> messageEvent.message);
        break;
      case MessageType.OPERATION_ACKNOWLEDGEMENT:
        this._handelOperationAck(<OperationAck> messageEvent.message);
        this._emitVersionChanged();
        break;
      case MessageType.REMOTE_CLIENT_OPENED:
        this._handleClientOpen(<RemoteClientOpenedModel> messageEvent.message);

        break;
      case MessageType.REMOTE_CLIENT_CLOSED:
        this._handleClientClosed(<RemoteClientClosedModel> messageEvent.message);
        break;
      case MessageType.MODEL_PERMISSIONS_CHANGED:
        this._handleModelPermissionsChanged(<ModelPermissionsChanged> messageEvent.message);
        break;
      default:
        throw new Error("Unexpected message");
    }
  }

  private _handleModelPermissionsChanged(message: ModelPermissionsChanged): void {
    const oldPermissions = this._permissions;
    this._permissions = message.permissions;

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

  private _handleClientOpen(message: RemoteClientOpenedModel): void {
    this._sessions.push(message.sessionId);

    this._referencesBySession[message.sessionId] = [];
    const event: CollaboratorOpenedEvent = new CollaboratorOpenedEvent(
      this, new ModelCollaborator(SessionIdParser.parseUsername(message.sessionId), message.sessionId));
    this._emitEvent(event);
    this._collaboratorsSubject.next(this.collaborators());
  }

  private _handleClientClosed(message: RemoteClientClosedModel): void {
    this._sessions = this._sessions.filter(s => s !== message.sessionId);

    const refs: Array<ModelReference<any>> = this._referencesBySession[message.sessionId];
    delete this._referencesBySession[message.sessionId];

    refs.forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });

    const event: CollaboratorClosedEvent = new CollaboratorClosedEvent(
      this, new ModelCollaborator(SessionIdParser.parseUsername(message.sessionId), message.sessionId)
    );
    this._emitEvent(event);

    // todo we could make this more performant by not calc'ing every time.
    this._collaboratorsSubject.next(this.collaborators());
  }

  private _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    let processedEvent: RemoteReferenceEvent;

    if (event.id === undefined) {
      this._modelReferenceEvent(event);
    } else {
      const value: RealTimeElement<any> = this._getRegisteredValue(event.id);
      if (!value) {
        return;
      }

      switch (event.type) {
        case MessageType.REFERENCE_PUBLISHED:
          processedEvent = Immutable.copy(event, {
            path: value.path()
          });

          const publishEvent: RemoteReferencePublished = <RemoteReferencePublished> event;
          if (publishEvent.values !== undefined) {
            let data: ModelReferenceData = {
              type: publishEvent.referenceType,
              id: publishEvent.id,
              values: publishEvent.values
            };
            data = this._concurrencyControl.processRemoteReferenceSet(data);
            processedEvent = Immutable.copy(processedEvent, {
              values: data.values
            });
          }
          break;
        case MessageType.REFERENCE_UNPUBLISHED:
        case MessageType.REFERENCE_CLEARED:
          processedEvent = Immutable.copy(event, {
            path: value.path()
          });
          break;
        case MessageType.REFERENCE_SET:
          const setEvent: RemoteReferenceSet = <RemoteReferenceSet> event;
          let data: ModelReferenceData = {
            type: setEvent.referenceType,
            id: setEvent.id,
            values: setEvent.values
          };
          data = this._concurrencyControl.processRemoteReferenceSet(data);
          processedEvent = Immutable.copy(event, {
            path: value.path(),
            values: data.values
          });
          break;
        default:
      }

      let r: ModelReference<any>;

      if (processedEvent.type === MessageType.REFERENCE_UNPUBLISHED) {
        r = value.reference(processedEvent.sessionId, processedEvent.key);
        const index: number = this._referencesBySession[processedEvent.sessionId].indexOf(r);
        this._referencesBySession[processedEvent.sessionId].splice(index, 1);
      }

      // TODO if we wind up being able to pause the processing of incoming
      // operations, then we would put this in a queue.  We would also need
      // to somehow wrap this in an object that stores the currentContext
      // version right now, so we know when to distribute this event.
      value._handleRemoteReferenceEvent(processedEvent);

      if (processedEvent.type === MessageType.REFERENCE_PUBLISHED) {
        r = value.reference(processedEvent.sessionId, processedEvent.key);
        this._referencesBySession[processedEvent.sessionId].push(r);
      }
    }
  }

  private _handleForceClose(message: ForceCloseRealTimeModel): void {
    console.error(`The model with id '${this._modelId}' was forcefully closed by the server: ${message.reason}`);

    const event: ModelClosedEvent = {
      src: this,
      name: RealTimeModel.Events.CLOSED,
      local: false,
      reason: message.reason
    };
    this._close(event);
  }

  private _close(event: ModelClosedEvent): void {
    this._model.root()._detach(false);
    this._open = false;
    this._connection = null;
    this._emitEvent(event);
  }

  private _handelOperationAck(message: OperationAck): void {
    // todo in theory we could pass the operation in to verify it as well.
    this._concurrencyControl.processAcknowledgementOperation(message.seqNo, message.version);
    this._version = message.version + 1;
    this._time = new Date(message.timestamp);
  }

  private _handleRemoteOperation(message: RemoteOperation): void {
    const unprocessed: UnprocessedOperationEvent = new UnprocessedOperationEvent(
      message.sessionId,
      -1, // fixme not needed, this is only needed when going to the server.  Perhaps
      // this should probably go in the op submission message.
      message.version,
      message.timestamp,
      message.operation
    );

    this._concurrencyControl.processRemoteOperation(unprocessed);
    const processed: ProcessedOperationEvent = this._concurrencyControl.getNextIncomingOperation();

    const operation: Operation = processed.operation;
    const clientId: string = processed.clientId;
    const contextVersion: number = processed.version;
    const timestamp: number = processed.timestamp;
    const username: string = SessionIdParser.parseUsername(message.sessionId);

    this._version = contextVersion + 1;
    this._time = new Date(timestamp);

    if (operation.type === OperationType.COMPOUND) {
      const compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        if (!op.noOp) {
          const modelEvent: ModelOperationEvent =
            new ModelOperationEvent(clientId, username, contextVersion, timestamp, op);
          this._deliverToChild(modelEvent);
        }
      });
    } else {
      const discreteOp: DiscreteOperation = <DiscreteOperation> operation;
      if (!discreteOp.noOp) {
        const modelEvent: ModelOperationEvent =
          new ModelOperationEvent(clientId, username, contextVersion, timestamp, discreteOp);
        this._deliverToChild(modelEvent);
      }
    }
  }

  private _deliverToChild(modelEvent: ModelOperationEvent): void {
    this._model.handleModelOperationEvent(modelEvent);
  }

  private _sendOperation(opEvent: UnprocessedOperationEvent): void {
    const opSubmission: OperationSubmission = {
      resourceId: this._resourceId,
      seqNo: opEvent.seqNo,
      version: opEvent.contextVersion,
      operation: opEvent.operation,
      type: MessageType.OPERATION_SUBMISSION
    };
    this._connection.send(opSubmission);
  }

  private _emitVersionChanged(): void {
    const event: VersionChangedEvent = {
      name: RealTimeModel.Events.VERSION_CHANGED,
      src: this,
      version: this._version
    };
    this._emitEvent(event);
  }

  private _modelReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
  }

  private _onRemoteReferencePublished(reference: ModelReference<any>): void {
    this._referencesBySession[reference.sessionId()].push(reference);
    this._emitEvent(new RemoteReferenceCreatedEvent(reference, undefined, this));
  }

  private _getMessageValues(ref: ModelReferenceData): string[] {
    switch (ref.type) {
      case ModelReference.Types.INDEX:
      case ModelReference.Types.PROPERTY:
      case ModelReference.Types.RANGE:
        return ref.values;
      case ModelReference.Types.ELEMENT:
        const elementIds: string[] = [];
        for (let element of ref.values) {
          elementIds.push((<RealTimeElement<any>> element).id());
        }
        return elementIds;
      default:
        throw new Error("Invalid reference type");
    }
  }

  private _initializeReferences(references: ReferenceData[]): void {
    references.forEach((ref: ReferenceData) => {
      let model: RealTimeElement<any>;
      if (ref.id !== undefined) {
        model = this._wrapperFactory.wrap(this._model._getRegisteredValue(ref.id));
      }

      const published: RemoteReferencePublished = {
        type: MessageType.REFERENCE_PUBLISHED,
        sessionId: ref.sessionId,
        username: SessionIdParser.deserialize(ref.sessionId).username,
        resourceId: this._resourceId,
        key: ref.key,
        id: ref.id,
        referenceType: ref.referenceType,
        values: ref.values
      };

      if (model !== undefined) {
        model._handleRemoteReferenceEvent(published);
        const r: ModelReference<any> = model.reference(ref.sessionId, ref.key);
        this._referencesBySession[ref.sessionId].push(r);
      } else {
        this._modelReferenceEvent(published);
      }

      if (ref.values) {
        const set: RemoteReferenceSet = {
          type: MessageType.REFERENCE_SET,
          sessionId: ref.sessionId,
          username: SessionIdParser.deserialize(ref.sessionId).username,
          resourceId: this._resourceId,
          key: ref.key,
          id: ref.id,
          referenceType: ref.referenceType,
          values: ref.values
        };

        if (model !== undefined) {
          model._handleRemoteReferenceEvent(set);
        } else {
          this._modelReferenceEvent(set);
        }
      }
    });
  }

  private _onShareReference(reference: LocalModelReference<any, any>): void {
    const source: any = reference.reference().source();
    const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

    const event: PublishReferenceEvent = {
      type: MessageType.PUBLISH_REFERENCE,
      resourceId: this._resourceId,
      key: reference.reference().key(),
      id: vid,
      referenceType: reference.reference().type(),
      values: reference.values(),
      version: this._concurrencyControl.contextVersion()
    };
    this._connection.send(event);
  }

  private _onUnshareReference(reference: LocalModelReference<any, any>): void {
    const source: any = reference.reference().source();
    const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

    const event: UnpublishReferenceEvent = {
      type: MessageType.UNPUBLISH_REFERENCE,
      resourceId: this._resourceId,
      key: reference.reference().key(),
      id: vid
    };
    this._connection.send(event);
  }

  private _onSetReference(reference: LocalModelReference<any, any>): void {
    const source: any = reference.reference().source();
    const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

    let refData: ModelReferenceData = {
      type: reference.reference().type(),
      id: vid,
      values: reference.reference().values()
    };

    // Only transform those that target a RealTimeElement
    if (vid !== undefined) {
      refData = this._concurrencyControl.processOutgoingSetReference(refData);
    }

    if (refData) {
      const event: SetReferenceEvent = {
        type: MessageType.SET_REFERENCE,
        resourceId: this._resourceId,
        key: reference.reference().key(),
        id: refData.id,
        referenceType: reference.reference().type(),
        values: this._getMessageValues(refData),
        version: this._concurrencyControl.contextVersion()
      };
      this._connection.send(event);
    }
  }

  private _onClearReference(reference: LocalModelReference<any, any>): void {
    const source: any = reference.reference().source();
    const vid: string = (source instanceof RealTimeElement) ? source.id() : null;

    const event: ClearReferenceEvent = {
      type: MessageType.CLEAR_REFERENCE,
      resourceId: this._resourceId,
      key: reference.reference().key(),
      id: vid
    };
    this._connection.send(event);
  }
}
Object.freeze(RealTimeModel.Events);

export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}

import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeValue} from "./RealTimeValue";
import {ReferenceManager} from "../reference/ReferenceManager";
import {ReferenceDisposedCallback} from "../reference/LocalModelReference";
import {Model} from "../internal/Model";
import {ObjectValue} from "../dataValue";
import {ReferenceData} from "../../connection/protocol/model/openRealtimeModel";
import {ModelFqn} from "../ModelFqn";
import {ClientConcurrencyControl} from "../ot/ClientConcurrencyControl";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {ModelService} from "../ModelService";
import {ReferenceType} from "../reference/ModelReference";
import {ModelReferenceCallbacks} from "../reference/LocalModelReference";
import {LocalModelReference} from "../reference/LocalModelReference";
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
import {RemoteSession} from "../../RemoteSession";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/LocalElementReference";
import {ElementReference} from "../reference/ElementReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
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
import {RemoteReferenceCreatedEvent} from "./events";
import {ModelEvent} from "./events";
import {ModelClosedEvent} from "./events";
import {VersionChangedEvent} from "./events";

export class RealTimeModel extends ConvergenceEventEmitter {

  static Events: any = {
    CLOSED: "closed",
    DELETED: "deleted",
    MODIFIED: "modified",
    COMMITTED: "committed",
    VERSION_CHANGED: "version_changed",
    SESSION_OPENED: "session_opened",
    SESSION_CLOSED: "session_closed",
    REFERENCE: "reference"
  };

  private _data: RealTimeObject;
  private _open: boolean;
  private _committed: boolean;
  private _referencesBySession: {[key: string]: ModelReference<any>[]};
  private _sessions: string[];
  private _idToValue: {[key: string]: RealTimeValue<any>};

  private _referenceManager: ReferenceManager;
  private _referenceDisposed: ReferenceDisposedCallback;
  private _callbacks: ModelEventCallbacks;

  private _model: Model;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(private _resourceId: string,
              valueIdPrefix: string,
              data: ObjectValue,
              sessions: string[],
              references: ReferenceData[],
              private _version: number,
              private _createdTime: Date,
              private _modifiedTime: Date,
              private _modelFqn: ModelFqn,
              private _concurrencyControl: ClientConcurrencyControl,
              private _connection: ConvergenceConnection,
              private _modelService: ModelService) {
    super();

    this._model = new Model(this.session().sessionId(), this.session().username(), valueIdPrefix, data);

    // we keep a map of all references by session so we can easily dispose of them
    // when a session disconnects.  It might be possible to do this by walking the
    // model as well.
    this._referencesBySession = {};
    this._sessions = sessions.slice(0);
    this._sessions.forEach((sessionId: string) => {
      this._referencesBySession[sessionId] = [];
    });

    this._idToValue = {};

    this._referenceManager = new ReferenceManager(this, ReferenceType.ELEMENT);

    this._concurrencyControl.on(ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED, (committed: boolean) => {
      this._committed = committed;
      var name: string = this._committed ? RealTimeModel.Events.COMMITTED : RealTimeModel.Events.MODIFIED;
      var evt: ModelEvent = {src: this, name: name};
      this.emit(name, evt);
    });

    // fixme these should have versions unless we move to GUIDs.
    // also move this out of this constructor.
    var referenceCallbacks: ModelReferenceCallbacks = {
      onPublish: (reference: LocalModelReference<any, any>): void => {
        let source: any = reference.reference().source();
        var vid: string = (source instanceof RealTimeValue) ? source.id() : null;

        var event: PublishReferenceEvent = {
          type: MessageType.PUBLISH_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: vid,
          referenceType: reference.reference().type()
        };
        this._connection.send(event);

      },
      onUnpublish: (reference: LocalModelReference<any, any>): void => {
        let source: any = reference.reference().source();
        var vid: string = (source instanceof RealTimeValue) ? source.id() : null;

        var event: UnpublishReferenceEvent = {
          type: MessageType.UNPUBLISH_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: vid
        };
        this._connection.send(event);
      },
      onSet: (reference: LocalModelReference<any, any>): void => {
        let source: any = reference.reference().source();
        var vid: string = (source instanceof RealTimeValue) ? source.id() : null;

        var refData: ModelReferenceData = {
          type: reference.reference().type(),
          id: vid,
          values: reference.reference().values()
        };

        // Only transform those that target a RealTimeValue
        if (vid !== undefined) {
          refData = this._concurrencyControl.processOutgoingSetReference(refData);
        }

        if (refData) {
          var event: SetReferenceEvent = {
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
      },
      onClear: (reference: LocalModelReference<any, any>): void => {
        let source: any = reference.reference().source();
        var vid: string = (source instanceof RealTimeValue) ? source.id() : null;

        var event: ClearReferenceEvent = {
          type: MessageType.CLEAR_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: vid
        };
        this._connection.send(event);
      }
    };

    this._callbacks = {
      sendOperationCallback: (operation: DiscreteOperation): void => {
        var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
        if (!this._concurrencyControl.isCompoundOperationInProgress()) {
          this._sendOperation(opEvent);
        }
      },
      referenceEventCallbacks: referenceCallbacks
    };

    let wrapperFactory: RealTimeWrapperFactory = new RealTimeWrapperFactory(this._callbacks);
    this._data = <RealTimeObject> wrapperFactory.wrap(this._model.root());

    this._open = true;
    this._committed = true;

    references.forEach((ref: ReferenceData) => {
      var published: RemoteReferencePublished = {
        type: MessageType.REFERENCE_PUBLISHED,
        sessionId: ref.sessionId,
        username: SessionIdParser.deserialize(ref.sessionId).username,
        resourceId: this._resourceId,
        key: ref.key,
        id: ref.id,
        referenceType: ref.referenceType
      };

      // fixme refactor
      if (published.id !== undefined) {
        var m: RealTimeValue<any> = this._idToValue[published.id];
        m._handleRemoteReferenceEvent(published);
        var r: ModelReference<any> = m.reference(ref.sessionId, ref.key);
        this._referencesBySession[ref.sessionId].push(r);
      } else {
        this._modelReferenceEvent(published);
      }


      if (ref.values) {
        var set: RemoteReferenceSet = {
          type: MessageType.REFERENCE_SET,
          sessionId: ref.sessionId,
          username: SessionIdParser.deserialize(ref.sessionId).username,
          resourceId: this._resourceId,
          key: ref.key,
          id: ref.id,
          referenceType: ref.referenceType,
          values: ref.values
        };
        if (set.id !== undefined) {
          m._handleRemoteReferenceEvent(set);
        } else {
          this._modelReferenceEvent(set);
        }
      }
    });
  }

  connectedSessions(): RemoteSession[] {
    return this._sessions.map((sessionId: string) => {
      return {
        username: SessionIdParser.parseUsername(sessionId),
        sessionId: sessionId
      };
    });
  }

  collectionId(): string {
    return this._modelFqn.collectionId;
  }

  modelId(): string {
    return this._modelFqn.modelId;
  }

  version(): number {
    return this._version;
  }

  createdTime(): Date {
    return this._createdTime;
  }

  modifiedTime(): Date {
    return this._modifiedTime;
  }

  // deprecated
  value(): RealTimeObject {
    return this._data;
  }

  root(): RealTimeObject {
    return this._data;
  }

  valueAt(path: any): RealTimeValue<any> {
    return this.root().valueAt(path);
  }

  session(): Session {
    return this._connection.session();
  }

  isOpen(): boolean {
    return this._open;
  }

  close(): Promise<void> {
    return this._modelService._close(this._resourceId).then(() => {
      var event: ModelClosedEvent = {
        src: this,
        name: RealTimeModel.Events.CLOSED,
        local: true
      };
      this._close(event);
    });
  }

  startCompound(): void {
    this._concurrencyControl.startCompoundOperation();
  }

  endCompound(): void {
    var opEvent: UnprocessedOperationEvent = this._concurrencyControl.completeCompoundOperation();
    this._sendOperation(opEvent);
  }

  isCompoundStarted(): boolean {
    return this._concurrencyControl.isCompoundOperationInProgress();
  }

  elementReference(key: string): LocalElementReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.ELEMENT) {
        throw new Error("A reference with this key already exists, but is not an element reference");
      } else {
        return <LocalElementReference>existing;
      }
    } else {
      var session: Session = this.session();
      var reference: ElementReference = new ElementReference(key, this, session.username(), session.sessionId(), true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalElementReference = new LocalElementReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.referenceMap().get(sessionId, key);
  }

  references(filter?: ReferenceFilter): ModelReference<any>[] {
    return this._referenceManager.referenceMap().getAll(filter);
  }


  //
  // Private API
  //

  _getRegisteredValue(id: string): RealTimeValue<any> {
    return this._idToValue[id];
  }

  _registerValue(value: RealTimeValue<any>): void {
    this._idToValue[value.id()] = value;
  }

  _unregisterValue(value: RealTimeValue<any>): void {
    delete this._idToValue[value.id()];
  }

  _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        this._handleForceClose(<ForceCloseRealTimeModel>messageEvent.message);
        break;
      case MessageType.REMOTE_OPERATION:
        this._handleRemoteOperation(<RemoteOperation>messageEvent.message);
        this._emitVersionChanged();
        break;
      case MessageType.REFERENCE_PUBLISHED:
      case MessageType.REFERENCE_UNPUBLISHED:
      case MessageType.REFERENCE_SET:
      case MessageType.REFERENCE_CLEARED:
        this._handleRemoteReferenceEvent(<RemoteReferenceEvent>messageEvent.message);
        break;
      case MessageType.OPERATION_ACKNOWLEDGEMENT:
        this._handelOperationAck(<OperationAck>messageEvent.message);
        this._emitVersionChanged();
        break;
      case MessageType.REMOTE_CLIENT_OPENED:
        this._handleClientOpen(<RemoteClientOpenedModel>messageEvent.message);

        break;
      case MessageType.REMOTE_CLIENT_CLOSED:
        this._handleClientClosed(<RemoteClientClosedModel>messageEvent.message);
        break;
      default:
        throw new Error("Unexpected message");
    }
  }

  private _handleClientOpen(message: RemoteClientOpenedModel): void {
    this._referencesBySession[message.sessionId] = [];
    var event: RemoteSessionOpenedEvent = {
      name: RealTimeModel.Events.SESSION_OPENED,
      src: this,
      sessionId: message.sessionId,
      username: SessionIdParser.parseUsername(message.sessionId)
    };
    this.emitEvent(event);
  }

  private _handleClientClosed(message: RemoteClientClosedModel): void {
    var refs: ModelReference<any>[] = this._referencesBySession[message.sessionId];
    delete this._referencesBySession[message.sessionId];

    refs.forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });

    var event: RemoteSessionClosedEvent = {
      name: RealTimeModel.Events.SESSION_CLOSED,
      src: this,
      sessionId: message.sessionId,
      username: SessionIdParser.parseUsername(message.sessionId)
    };
    this.emitEvent(event);
  }

  private _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    var processedEvent: RemoteReferenceEvent;

    if (event.id === undefined) {
      this._modelReferenceEvent(event);
    } else {

      var value: RealTimeValue<any> = this._idToValue[event.id];
      if (!value) {
        return;
      }

      switch (event.type) {
        case MessageType.REFERENCE_PUBLISHED:
        case MessageType.REFERENCE_UNPUBLISHED:
        case MessageType.REFERENCE_CLEARED:
          processedEvent = Immutable.copy(event, {
            path: value.path()
          });
          break;
        case MessageType.REFERENCE_SET:
          var setEvent: RemoteReferenceSet = <RemoteReferenceSet>event;
          var data: ModelReferenceData = {
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

      var r: ModelReference<any>;

      if (processedEvent.type === MessageType.REFERENCE_UNPUBLISHED) {
        r = value.reference(processedEvent.sessionId, processedEvent.key);
        var index: number = this._referencesBySession[processedEvent.sessionId].indexOf(r);
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
    var event: ModelClosedEvent = {
      src: this,
      name: RealTimeModel.Events.CLOSED,
      local: false,
      reason: message.reason
    };
    this._close(event);
  }

  private _close(event: ModelClosedEvent): void {
    this._model.root()._detach();
    this._open = false;
    this._connection = null;
    this.emitEvent(event);
  }

  private _handelOperationAck(message: OperationAck): void {
    // todo in theory we could pass the operation in to verify it as well.
    this._concurrencyControl.processAcknowledgementOperation(message.seqNo, message.version);
    this._version = message.version + 1;
    this._modifiedTime = new Date(message.timestamp);
  }

  private _handleRemoteOperation(message: RemoteOperation): void {
    var unprocessed: UnprocessedOperationEvent = new UnprocessedOperationEvent(
      message.sessionId,
      -1, // fixme not needed, this is only needed when going to the server.  Perhaps
      // this should probalby go in the op submission message.
      message.version,
      message.timestamp,
      message.operation
    );

    this._concurrencyControl.processRemoteOperation(unprocessed);
    var processed: ProcessedOperationEvent = this._concurrencyControl.getNextIncomingOperation();

    var operation: Operation = processed.operation;
    var clientId: string = processed.clientId;
    var contextVersion: number = processed.version;
    var timestamp: number = processed.timestamp;
    var username: string = SessionIdParser.parseUsername(message.sessionId);

    this._version = contextVersion + 1;
    this._modifiedTime = new Date(timestamp);

    if (operation.type === OperationType.COMPOUND) {
      let compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        if (!op.noOp) {
          var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, username, contextVersion, timestamp, op);
          this._deliverToChild(modelEvent);
        }
      });
    } else {
      let discreteOp: DiscreteOperation = <DiscreteOperation> operation;
      if (!discreteOp.noOp) {
        var modelEvent: ModelOperationEvent =
          new ModelOperationEvent(clientId, username, contextVersion, timestamp, discreteOp);
        this._deliverToChild(modelEvent);
      }
    }
  }

  private _deliverToChild(modelEvent: ModelOperationEvent): void {
    this._model.handleModelOperationEvent(modelEvent);
  }

  private _sendOperation(opEvent: UnprocessedOperationEvent): void {
    var opSubmission: OperationSubmission = {
      resourceId: this._resourceId,
      seqNo: opEvent.seqNo,
      version: opEvent.contextVersion,
      operation: opEvent.operation,
      type: MessageType.OPERATION_SUBMISSION
    };
    this._connection.send(opSubmission);
  }

  private _emitVersionChanged(): void {
    var event: VersionChangedEvent = {
      name: RealTimeModel.Events.VERSION_CHANGED,
      src: this,
      version: this._version
    };
    this.emitEvent(event);
  }

  private _modelReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
    if (event.type === MessageType.REFERENCE_PUBLISHED) {
      var reference: ModelReference<any> = this._referenceManager.referenceMap().get(event.sessionId, event.key);
      this._referencesBySession[event.sessionId].push(reference);

      var createdEvent: RemoteReferenceCreatedEvent = {
        name: RealTimeModel.Events.REFERENCE,
        src: this,
        reference: reference
      };
      this.emitEvent(createdEvent);
    }
  }

  private _getMessageValues(ref: ModelReferenceData): string[] {
    switch (ref.type) {
      case ReferenceType.INDEX:
      case ReferenceType.PROPERTY:
      case ReferenceType.RANGE:
        return ref.values;
      case ReferenceType.ELEMENT:
        var elementIds: string[] = [];
        for (var element of ref.values) {
          elementIds.push((<RealTimeValue<any>> element).id());
        }
        return elementIds;
      default:
        throw new Error("Invalid reference type");
    }
  }
}

Object.freeze(RealTimeModel.Events);

export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}

export interface RemoteSessionOpenedEvent extends ModelEvent {
  username: string;
  sessionId: string;
}

export interface RemoteSessionClosedEvent extends ModelEvent {
  username: string;
  sessionId: string;
}


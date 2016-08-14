import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeValue} from "./RealTimeValue";
import {ObjectValue, DataValue} from "../dataValue";
import {ReferenceData} from "../../connection/protocol/model/openRealtimeModel";
import {ModelFqn} from "../ModelFqn";
import {ClientConcurrencyControl} from "../ot/ClientConcurrencyControl";
import {ConvergenceConnection, MessageEvent} from "../../connection/ConvergenceConnection";
import {ModelService} from "../ModelService";
import {ModelReferenceCallbacks, LocalModelReference} from "../reference/LocalModelReference";
import {
  PublishReferenceEvent, UnpublishReferenceEvent,
  SetReferenceEvent, ClearReferenceEvent, RemoteReferencePublished, RemoteReferenceSet, RemoteReferenceEvent
} from "../../connection/protocol/model/reference/ReferenceEvent";
import {MessageType} from "../../connection/protocol/MessageType";
import {ModelReferenceData} from "../ot/xform/ReferenceTransformer";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {UnprocessedOperationEvent} from "../ot/UnprocessedOperationEvent";
import {SessionIdParser} from "../../connection/protocol/SessionIdParser";
import {RemoteSession} from "../../RemoteSession";
import {Session} from "../../Session";
import {DataValueFactory} from "../DataValueFactory";
import {ForceCloseRealTimeModel} from "../../connection/protocol/model/forceCloseRealtimeModel";
import {RemoteOperation} from "../../connection/protocol/model/remoteOperation";
import {OperationAck} from "../../connection/protocol/model/operationAck";
import {RemoteClientOpenedModel, RemoteClientClosedModel} from "../../connection/protocol/model/remoteOpenClose";
import {Immutable} from "../../util/Immutable";
import {ProcessedOperationEvent} from "../ot/ProcessedOperationEvent";
import {Operation} from "../ot/ops/Operation";
import {OperationType} from "../ot/ops/OperationType";
import {CompoundOperation} from "../ot/ops/CompoundOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationSubmission} from "../../connection/protocol/model/operationSubmission";
import {ModelEvent, VersionChangedEvent, ModelClosedEvent, ObservableModel} from "../observable/ObservableModel";
import {Path} from "../ot/Path";

export class RealTimeModel extends ConvergenceEventEmitter implements ObservableModel {

  static Events: any = {
    CLOSED: "closed",
    DELETED: "deleted",
    MODIFIED: "modified",
    COMMITTED: "committed",
    VERSION_CHANGED: "version_changed",
    SESSION_OPENED: "session_opened",
    SESSION_CLOSED: "session_closed"
  };

  private _data: RealTimeObject;
  private _open: boolean;
  private _committed: boolean;
  private _referencesBySession: {[key: string]: ModelReference<any>[]};
  private _sessions: string[];
  private _idToValue: {[key: string]: RealTimeValue<any>};

  private _vidPrefix: string;
  private _vidCounter: number;
  private _idGenerator: () => string = () => {
    return this._vidPrefix + this._vidCounter++;
  };


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

    // we keep a map of all references by session so we can easily dispose of them
    // when a session disconnects.  It might be possible to do this by walking the
    // model as well.
    this._referencesBySession = {};
    this._sessions = sessions.slice(0);
    this._sessions.forEach((sessionId: string) => {
      this._referencesBySession[sessionId] = [];
    });

    this._idToValue = {};

    this._vidPrefix = valueIdPrefix;
    this._vidCounter = 0;

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
        var id: string = reference.reference().source().id();
        var event: PublishReferenceEvent = {
          type: MessageType.PUBLISH_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: id,
          referenceType: reference.reference().type()
        };
        this._connection.send(event);

      },
      onUnpublish: (reference: LocalModelReference<any, any>): void => {
        var id: string = reference.reference().source().id();
        var event: UnpublishReferenceEvent = {
          type: MessageType.UNPUBLISH_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: id
        };
        this._connection.send(event);
      },
      onSet: (reference: LocalModelReference<any, any>): void => {
        var refData: ModelReferenceData = {
          type: reference.reference().type(),
          id: reference.reference().source().id(),
          value: reference.reference().value()
        };

        refData = this._concurrencyControl.processOutgoingSetReference(refData);
        if (refData) {
          var event: SetReferenceEvent = {
            type: MessageType.SET_REFERENCE,
            resourceId: this._resourceId,
            key: reference.reference().key(),
            id: refData.id,
            referenceType: reference.reference().type(),
            value: refData.value,
            version: this._concurrencyControl.contextVersion()
          };
          this._connection.send(event);
        }
      },
      onClear: (reference: LocalModelReference<any, any>): void => {
        var id: string = reference.reference().source().id();
        var event: ClearReferenceEvent = {
          type: MessageType.CLEAR_REFERENCE,
          resourceId: this._resourceId,
          key: reference.reference().key(),
          id: id
        };
        this._connection.send(event);
      }
    };

    var callbacks: ModelEventCallbacks = {
      sendOperationCallback: (operation: DiscreteOperation): void => {
        var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
        if (!this._concurrencyControl.isCompoundOperationInProgress()) {
          this._sendOperation(opEvent);
        }
      },
      referenceEventCallbacks: referenceCallbacks
    };

    this._data = new RealTimeObject(data, null, null, callbacks, this);

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
      var m: RealTimeValue<any> = this._idToValue[published.id];
      m._handleRemoteReferenceEvent(published);
      var r: ModelReference<any> = m.reference(ref.sessionId, ref.key);
      this._referencesBySession[ref.sessionId].push(r);

      if (ref.value) {
        var set: RemoteReferenceSet = {
          type: MessageType.REFERENCE_SET,
          sessionId: ref.sessionId,
          username: SessionIdParser.deserialize(ref.sessionId).username,
          resourceId: this._resourceId,
          key: ref.key,
          id: ref.id,
          referenceType: ref.referenceType,
          value: ref.value
        };
        m._handleRemoteReferenceEvent(set);
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
    var pathArgs: Path = Array.isArray(path) ? path : arguments;
    return this._data._path(pathArgs);
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

  //
  // Private API
  //

  _registerValue(value: RealTimeValue<any>): void {
    this._idToValue[value.id()] = value;
  }

  _unregisterValue(value: RealTimeValue<any>): void {
    delete this._idToValue[value.id()];
  }

  _createDataValue(data: any): DataValue {
    return DataValueFactory.createDataValue(data, this._idGenerator);
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
          value: setEvent.value
        };
        data = this._concurrencyControl.processRemoteReferenceSet(data);
        processedEvent = Immutable.copy(event, {
          path: value.path(),
          value: data.value
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
    this._data._detach();
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
      var compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, username, contextVersion, timestamp, op);
        this._deliverToChild(modelEvent);
      });
    } else {
      var modelEvent: ModelOperationEvent =
        new ModelOperationEvent(clientId, username, contextVersion, timestamp, <DiscreteOperation> operation);
      this._deliverToChild(modelEvent);
    }
  }

  private _deliverToChild(modelEvent: ModelOperationEvent): void {
    var child: RealTimeValue<any> = this._idToValue[modelEvent.operation.id];
    if (child) {
      child._handleRemoteOperation(modelEvent);
    }
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


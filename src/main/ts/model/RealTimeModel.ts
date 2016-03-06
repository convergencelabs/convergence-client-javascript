import ModelFqn from "./ModelFqn";
import RealTimeObject from "./RealTimeObject";
import Session from "../Session";
import ClientConcurrencyControl from "./ot/ClientConcurrencyControl";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import DiscreteOperation from "./ot/ops/DiscreteOperation";
import UnprocessedOperationEvent from "./ot/UnprocessedOperationEvent";
import ProcessedOperationEvent from "./ot/ProcessedOperationEvent";
import ModelOperationEvent from "./ModelOperationEvent";
import CompoundOperation from "./ot/ops/CompoundOperation";
import Operation from "./ot/ops/Operation";
import MessageType from "../connection/protocol/MessageType";
import {ForceCloseRealTimeModel} from "../connection/protocol/model/forceCloseRealtimeModel";
import {MessageEvent} from "../connection/ConvergenceConnection";
import ModelService from "./ModelService";
import {OperationSubmission} from "../connection/protocol/model/operationSubmission";
import {RemoteOperation} from "../connection/protocol/model/remoteOperation";
import {OperationAck} from "../connection/protocol/model/operationAck";
import {RealTimeValue} from "./RealTimeValue";
import {Path} from "./ot/Path";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {ModelReferenceCallbacks} from "./reference/LocalModelReference";
import {LocalModelReference} from "./reference/LocalModelReference";
import {PublishReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {UnpublishReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ClearReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {SetReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ModelReferenceData} from "./ot/xform/ReferenceTransformer";
import {OperationType} from "./ot/ops/OperationType";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import Immutable from "../util/Immutable";
import {RemoteReferenceSet} from "../connection/protocol/model/reference/ReferenceEvent";

export class RealTimeModel extends ConvergenceEventEmitter {

  static Events: any = {
    CLOSED: "closed",
    DELETED: "deleted",
    MODIFIED: "modified",
    COMMITTED: "committed"
  };

  private _data: RealTimeObject;
  private _open: boolean;
  private _committed: boolean;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(private _resourceId: string,
              _data: Object,
              private _version: number,
              private _createdTime: Date,
              private _modifiedTime: Date,
              private _modelFqn: ModelFqn,
              private _concurrencyControl: ClientConcurrencyControl,
              private _connection: ConvergenceConnection,
              private _modelService: ModelService) {
    super();

    this._concurrencyControl.on(ClientConcurrencyControl.Events.COMMIT_STATE_CHANGED, (committed: boolean) => {
      this._committed = committed;
      var name: string = this._committed ? RealTimeModel.Events.COMMITTED : RealTimeModel.Events.MODIFIED;
      var evt: RealTimeModelEvent = {src: this, name: name};
      this.emit(name, evt);
    });

    var referenceCallbacks: ModelReferenceCallbacks = {
      onPublish: (reference: LocalModelReference<any>): void => {
        var path: Path = reference.reference().source().path();
        path = this._concurrencyControl.processOutgoingReferencePath(path);
        if (path) {
          var event: PublishReferenceEvent = {
            resourceId: this._resourceId,
            key: reference.reference().key(),
            path: path,
            referenceType: reference.reference().type()
          };
          this._connection.send(event);
        }
      },
      onUnpublish: (reference: LocalModelReference<any>): void => {
        var path: Path = reference.reference().source().path();
        path = this._concurrencyControl.processOutgoingReferencePath(path);
        if (path) {
          var event: UnpublishReferenceEvent = {
            resourceId: this._resourceId,
            key: reference.reference().key(),
            path: path
          };
          this._connection.send(event);
        }
      },
      onSet: (reference: LocalModelReference<any>): void => {
        var refData: ModelReferenceData = {
          type: reference.reference().type(),
          path: reference.reference().source().path(),
          value: reference.reference()
        };

        refData = this._concurrencyControl.processOutgoingSetReference(refData);
        if (refData) {
          var event: SetReferenceEvent = {
            resourceId: this._resourceId,
            key: reference.reference().key(),
            path: refData.path,
            referenceType: reference.reference().type(),
            value: refData.value
          };
          this._connection.send(event);
        }
      },
      onClear: (reference: LocalModelReference<any>): void => {
        var path: Path = reference.reference().source().path();
        path = this._concurrencyControl.processOutgoingReferencePath(path);
        if (path) {
          var event: ClearReferenceEvent = {
            resourceId: this._resourceId,
            key: reference.reference().key(),
            path: path
          };
          this._connection.send(event);
        }
      }
    };

    var callbacks: ModelEventCallbacks = {
      sendOperationCallback: (operation: DiscreteOperation): void => {
        var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
        this._sendOperation(opEvent);
      },
      referenceEventCallbacks: referenceCallbacks
    };

    this._data = new RealTimeObject(_data, null, null, callbacks, this);

    this._open = true;
    this._committed = true;
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

  data(): RealTimeObject {
    return this._data;
  }

  dataAt(path: any): RealTimeValue<any> {
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
      var event: RealTimeModelClosedEvent = {
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

  _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        this._handleForceClose(<ForceCloseRealTimeModel>messageEvent.message);
        break;
      case MessageType.REMOTE_OPERATION:
        this._handleRemoteOperation(<RemoteOperation>messageEvent.message);
        break;
      case MessageType.REFERENCE_PUBLISHED:
      case MessageType.REFERENCE_UNPUBLISHED:
      case MessageType.REFERENCE_SET:
      case MessageType.REFERENCE_CLEARED:
        this._handleRemoteReferenceEvent(<RemoteReferenceEvent>messageEvent.message);
        break;
      case MessageType.OPERATION_ACKNOWLEDGEMENT:
        this._handelOperationAck(<OperationAck>messageEvent.message);
        break;
      default:
        throw new Error("Unexpected message");
    }
  }

  private _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    var processedEvent: RemoteReferenceEvent;

    switch (event.type) {
      case MessageType.REFERENCE_PUBLISHED:
      case MessageType.REFERENCE_UNPUBLISHED:
      case MessageType.REFERENCE_CLEARED:
        var currentPath: Path = this._concurrencyControl.processRemoteReferencePath(event.path);
        if (currentPath) {
          processedEvent = Immutable.copy(event, {
            path: currentPath
          });
        }
        break;
      case MessageType.REFERENCE_SET:
        var setEvent: RemoteReferenceSet = <RemoteReferenceSet>event;
        var data: ModelReferenceData = {
          type: setEvent.referenceType,
          path: setEvent.path,
          value: setEvent.value
        };
        data = this._concurrencyControl.processRemoteReferenceSet(data);
        if (data) {
          processedEvent = Immutable.copy(event, {
            path: data.path,
            value: data.value
          });
        }
        break;
      default:
    }

    // TODO if we wind up being able to pause the processing of incoming
    // operations, then we would put this in a queue.  We would also need
    // to somehow wrap this in an object that stores the currentContext
    // version right now, so we know when to distribute this event.
    if (processedEvent !== undefined) {
      this._data._handleRemoteReferenceEvent(event.path, event);
    }
  }

  private _handleForceClose(message: ForceCloseRealTimeModel): void {
    var event: RealTimeModelClosedEvent = {
      src: this,
      name: RealTimeModel.Events.CLOSED,
      local: false,
      reason: message.reason
    };
    this._close(event);
  }

  private _close(event: RealTimeModelClosedEvent): void {
    this._data._detach();
    this._open = false;
    this._connection = null;
    this.emitEvent(event);
  }

  private _handelOperationAck(message: OperationAck): void {
    // todo in theory we could pass the operation in to verify it as well.
    this._concurrencyControl.processAcknowledgementOperation(message.seqNo, message.version);
  }

  private _handleRemoteOperation(message: RemoteOperation): void {
    var unprocessed: UnprocessedOperationEvent = new UnprocessedOperationEvent(
      message.clientId,
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
    var userId: string = "userId"; // fixme

    this._version = contextVersion;
    this._modifiedTime = new Date(timestamp);

    if (operation.type === OperationType.COMPOUND) {
      var compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        // TODO: Determine where to get userId
        var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, userId, contextVersion, timestamp, op);
        this._data._handleRemoteOperation(modelEvent.operation.path, modelEvent);
      });
    } else {
      var modelEvent: ModelOperationEvent =
        new ModelOperationEvent(clientId, userId, contextVersion, timestamp, <DiscreteOperation> operation);
      this._data._handleRemoteOperation(modelEvent.operation.path, modelEvent);
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
}

export interface ModelEventCallbacks {
  sendOperationCallback: (operation: DiscreteOperation) => void;
  referenceEventCallbacks: ModelReferenceCallbacks;
}

interface RealTimeModelEvent extends ConvergenceEvent {
  src: RealTimeModel;
}

interface RealTimeModelClosedEvent extends RealTimeModelEvent {
  local: boolean;
  reason?: string;
}

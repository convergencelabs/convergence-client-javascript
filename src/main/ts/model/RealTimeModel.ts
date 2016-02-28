import {Promise} from 'es6-promise';

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
import RealTimeValue from "./RealTimeValue";
import {Path} from "./ot/Path";
import ConvergenceEvent from "../util/ConvergenceEvent";
import OperationType from "../connection/protocol/model/OperationType";
import ConvergenceEventEmitter from "../util/ConvergenceEventEmitter";

export default class RealTimeModel extends ConvergenceEventEmitter {

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

    this._data = new RealTimeObject(_data, null, null, (operation: DiscreteOperation) => {
      var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
      this._sendOperation(opEvent);
    }, this);

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
        local: true};
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
      case MessageType.OPERATION_ACKNOWLEDGEMENT:
        this._handelOperationAck(<OperationAck>messageEvent.message);
        break;
      default:
        throw new Error("Unexpected message");
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
      -1, // not needed
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

interface RealTimeModelEvent extends ConvergenceEvent {
  src: RealTimeModel;
}

interface RealTimeModelClosedEvent extends RealTimeModelEvent {
  local: boolean;
  reason?: string;
}

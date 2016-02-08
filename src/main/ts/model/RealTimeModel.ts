import EventEmitter from "../util/EventEmitter";
import ModelFqn from "./ModelFqn";
import RealTimeObject from "./RealTimeObject";
import Session from "../Session";
import ClientConcurrencyControl from "../ot/ClientConcurrencyControl";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import UnprocessedOperationEvent from "../ot/UnprocessedOperationEvent";
import ProcessedOperationEvent from "../ot/ProcessedOperationEvent";
import ModelOperationEvent from "./ModelOperationEvent";
import CompoundOperation from "../ot/ops/CompoundOperation";
import Operation from "../ot/ops/Operation";
import MessageType from "../protocol/MessageType";
import {ForceCloseRealTimeModel} from "../protocol/model/forceCloseRealtimeModel";
import {MessageEvent} from "../connection/ConvergenceConnection";
import ModelService from "./ModelService";
import {OperationSubmission} from "../protocol/model/operationSubmission";
import {RemoteOperation} from "../protocol/model/removeOperation";
import {OperationAck} from "../protocol/model/operationAck";

export default class RealTimeModel extends EventEmitter {

  static Events: any = {
    CLOSED: "closed",
    DELETED: "deleted",
    COMMIT_STATE_CHANGED: "commitStateChanged"
  };

  private _value: RealTimeObject;

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
      this.emit(RealTimeModel.Events.COMMIT_STATE_CHANGED, committed);
    });

    this._value = new RealTimeObject(_data, null, null, (operation: DiscreteOperation) => {
      var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
      this._sendOperation(opEvent);
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

  data(): RealTimeObject {
    return this._value;
  }

  session(): Session {
    return this._connection.session();
  }

  close(): Promise<void> {
    return this._modelService._close(this._resourceId).then(() => {
      this.emit(RealTimeModel.Events.CLOSED);
    });
  }

  beginCompoundOperation(): void {
    this._concurrencyControl.startCompoundOperation();
  }

  completeCompoundOperation(): void {
    var opEvent: UnprocessedOperationEvent = this._concurrencyControl.completeCompoundOperation();
    this._sendOperation(opEvent);
  }

  isCompoundOperationInProgress(): boolean {
    return this._concurrencyControl.isCompoundOperationInProgress();
  }

  _handleMessage(messageEvent: MessageEvent): void {
    switch (messageEvent.message.type) {
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        this._handleForceClose(<ForceCloseRealTimeModel>messageEvent.message);
        break;
      case MessageType.REMOTE_OPERATION:
        this._handleRemoteOperation(<RemoteOperation>messageEvent.message);
        break;
      case MessageType.OPERATION_ACK:
        this._handelOperationAck(<OperationAck>messageEvent.message);
        break;
      default:
        throw new Error("Unexpected message");
    }
  }

  private _handleForceClose(message: ForceCloseRealTimeModel): void {
    this.emit(RealTimeModel.Events.CLOSED, message.reason);
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

    this._version = contextVersion;
    this._modifiedTime = new Date(timestamp);

    if (operation.type === CompoundOperation.TYPE) {
      var compoundOp: CompoundOperation = <CompoundOperation> operation;
      compoundOp.ops.forEach((op: DiscreteOperation) => {
        // TODO: Determine where to get userId
        var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, "user", contextVersion, timestamp, op);
        this._value._handleIncomingOperation(modelEvent);
      });
    } else {
      var modelEvent: ModelOperationEvent =
        new ModelOperationEvent(clientId, "user", contextVersion, timestamp, <DiscreteOperation> operation);
      this._value._handleIncomingOperation(modelEvent);
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

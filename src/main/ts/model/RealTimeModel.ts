import EventEmitter from "../util/EventEmitter";
import ModelFqn from "./ModelFqn";
import RealTimeObject from "./RealTimeObject";
import Session from "../Session";
import ClientConcurrencyControl from "../ot/ClientConcurrencyControl";
import OperationTransformer from "../ot/xform/OperationTransformer";
import TransformationFunctionRegistry from "../ot/xform/TransformationFunctionRegistry";
import ConvergenceConnection from "../connection/ConvergenceConnection";
import RealTimeValueFactory from "./RealTimeValueFactory";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import UnprocessedOperationEvent from "../ot/UnprocessedOperationEvent";
import ProcessedOperationEvent from "../ot/ProcessedOperationEvent";
import ModelOperationEvent from "./ModelOperationEvent";
import CompoundOperation from "../ot/ops/CompoundOperation";
import Operation from "../ot/ops/Operation";

export default class RealTimeModel extends EventEmitter {

  private _value: RealTimeObject;

  /**
   * Constructs a new RealTimeModel.
   */
  constructor(data: Object,
              private _version: number,
              private _createdTime: Date,
              private _modifiedTime: Date,
              private _modelFqn: ModelFqn,
              private _concurrencyControl: ClientConcurrencyControl,
              private _connection: ConvergenceConnection) {
    super();

    this._value = new RealTimeObject(data, null, null, (operation: DiscreteOperation) => {
      var opEvent: UnprocessedOperationEvent = this._concurrencyControl.processOutgoingOperation(operation);
      if (opEvent) {
        // this._connection.send()
      }
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

  /**
   * Gets the session of the connected user.
   * @return {convergence.Session} The users session.
   */
  session(): Session {
    return this._connection.session();
  }

  close(): void {
    //TODO: Implement Close
  };

  beginCompoundOperation(): void {
    this._concurrencyControl.startCompoundOperation();
  }

  completeCompoundOperation(): void {
    var opEvent: UnprocessedOperationEvent = this._concurrencyControl.completeCompoundOperation();
    if (opEvent) {
      // this._connection.send()
    }
  }

  isCompoundOperationInProgress(): boolean {
    return this._concurrencyControl.isCompoundOperationInProgress();
  }

  _handleMessage(message) {
    // Handle Messages
  }

  _processOperationEvent(operationEvent: ProcessedOperationEvent) {

    var operation: Operation = operationEvent.operation;
    var clientId: string = operationEvent.clientId;
    var contextVersion: number = operationEvent.contextVersion;
    var timestamp: number = operationEvent.timestamp;

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
      var modelEvent: ModelOperationEvent = new ModelOperationEvent(clientId, "user", contextVersion, timestamp, <DiscreteOperation> operation);
      this._value._handleIncomingOperation(modelEvent);
    }

  }
}

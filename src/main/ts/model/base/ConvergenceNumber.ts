import {PathElement} from ".././ot/Path";
import {NumberAddOperation} from ".././ot/ops/NumberAddOperation";
import {NumberSetOperation} from ".././ot/ops/NumberSetOperation";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {OperationType} from ".././ot/ops/OperationType";
import {NumberValue} from ".././dataValue";
import {ConvergenceValue, ModelValueEvent} from "./ConvergenceValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValueType} from "./ConvergenceValueType";

export default class ConvergenceNumber extends ConvergenceValue<number> {

  static Events: any = {
    ADD: "add",
    VALUE: "value",
    DETACHED: ConvergenceValue.Events.DETACHED,
    MODEL_CHANGED: ConvergenceValue.Events.MODEL_CHANGED
  };

  private _data: number;

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(data: NumberValue,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Number, data.id, parent, fieldInParent, model);

    this._data = data.value;
  }

  protected _getValue(): number {
    return this._data;
  }

  // Handlers for incoming operations

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === OperationType.NUMBER_ADD) {
      this._handleAddOperation(operationEvent);
    } else if (type === OperationType.NUMBER_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleAddOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberAddOperation = <NumberAddOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data += value;

    var event: NumberAddEvent = {
      src: this,
      name: ConvergenceNumber.Events.ADD,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
    this._bubbleModelChangedEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberSetOperation = <NumberSetOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data = value;

    var event: NumberSetValueEvent = {
      src: this,
      name: ConvergenceNumber.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
    this._bubbleModelChangedEvent(event);
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }
}

export interface NumberSetValueEvent extends ModelValueEvent {
  src: ConvergenceNumber;
  value:  number;
}

export interface NumberAddEvent extends ModelValueEvent {
  src: ConvergenceNumber;
  value:  number;
}

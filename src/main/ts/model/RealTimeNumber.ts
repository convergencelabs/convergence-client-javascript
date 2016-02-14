import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import NumberAddOperation from "../ot/ops/NumberAddOperation";
import NumberSetOperation from "../ot/ops/NumberSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";
import {ModelChangeEvent} from "./events";
import OperationType from "../protocol/model/OperationType";

export default class RealTimeNumber extends RealTimeValue<number> {

  static Events: any = {
    ADD: "add",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(private _data: number,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              _sendOperation: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Number, parent, fieldInParent, _sendOperation);
  }

  add(value: number): void {
    this._validateNumber(value);

    if (value !== 0) {
      var operation: NumberAddOperation = new NumberAddOperation(this.path(), false, value);
      this._data += value;
      this._sendOperation(operation);
    }
  }

  subtract(value: number): void {
    this.add(-value);
  }

  increment(): void {
    this.add(1);
  }

  decrement(): void {
    this.add(-1);
  }

  protected _setValue(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }

    var operation: NumberSetOperation = new NumberSetOperation(this.path(), false, value);
    this._data = value;
    this._sendOperation(operation);
  }

  protected _getValue(): number {
    return this._data;
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: OperationType = operationEvent.operation.type;
      if (type === OperationType.NUMBER_ADD) {
        this._handleAddOperation(operationEvent);
      } else if (type === OperationType.NUMBER_VALUE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      throw new Error("Invalid path: number values do not have children");
    }
  }

  private _handleAddOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberAddOperation = <NumberAddOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data += value;

    var event: NumberAddEvent = {
      src: this,
      name: RealTimeNumber.Events.ADD,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberSetOperation = <NumberSetOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data = value;

    var event: NumberSetValueEvent = {
      src: this,
      name: RealTimeNumber.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }
}

export interface NumberSetValueEvent extends ModelChangeEvent {
  src: RealTimeNumber;
  value:  number;
}

export interface NumberAddEvent extends ModelChangeEvent {
  src: RealTimeNumber;
  value:  number;
}

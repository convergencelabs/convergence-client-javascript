import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import NumberAddOperation from "../ot/ops/NumberAddOperation";
import NumberSetOperation from "../ot/ops/NumberSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import NumberAddEvent from "./events/NumberAddEvent";
import NumberSetEvent from "./events/NumberSetEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";

export default class RealTimeNumber extends RealTimeValue<number> {

  static Events: any = {
    ADD: "add",
    SET: "set"
  };

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(private _data: number,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Number, parent, fieldInParent, sendOpCallback);
  }

  /**
   * Adds the value to the RealTimeNumber.
   * @param {number} a number to add
   */
  add(value: number): void {
    this._validateNumber(value);

    if (value !== 0) {
      var operation: NumberAddOperation = new NumberAddOperation(this.path(), false, value);
      this._data += value;
      this.sendOpCallback(operation);
    }
  }

  /**
   * Subtracts the value from the RealTimeNumber.
   * @param {number} a number to subtract
   */
  subtract(value: number): void {
    this.add(-value);
  }

  /**
   * Increments the value of this RealTimeNumber by 1.
   */
  increment(): void {
    this.add(1);
  }

  /**
   * Decrements the value of this RealTimeNumber by 1.
   */
  decrement(): void {
    this.add(-1);
  }

  /**
   * Sets the value of the RealTimeNumber
   * @param {Number} value The new value.
   */
  setValue(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }

    var operation: NumberSetOperation = new NumberSetOperation(this.path(), false, value);
    this._data = value;
    this.sendOpCallback(operation);
  }

  value(): number {
    return this._data;
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: string = operationEvent.operation.type;
      if (type === NumberAddOperation.TYPE) {
        this._handleAddOperation(operationEvent);
      } else if (type === NumberSetOperation.TYPE) {
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

    var event: NumberAddEvent = new NumberAddEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      value);
    this.emit(RealTimeNumber.Events.ADD, event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberSetOperation = <NumberSetOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data = value;

    var event: NumberSetEvent = new NumberSetEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      value);
    this.emit(RealTimeNumber.Events.SET, event);
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }
}

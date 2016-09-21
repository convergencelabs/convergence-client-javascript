import {ModelNode} from "./ModelNode";
import {NumberValue} from "../dataValue";
import {Model} from "./Model";
import {ModelValueType} from "../ModelValueType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../ot/Path";
import {NumberNodeAddEvent} from "./events";
import {NumberNodeSetValueEvent} from "./events";
import {NumberAdd} from "../ot/ops/operationChanges";
import {NumberSet} from "../ot/ops/operationChanges";

export class NumberNode extends ModelNode<number> {

  static Events: any = {
    ADD: "add",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: number;

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(data: NumberValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelValueType.Number, data.id, path, model, sessionId, username);

    this._data = data.value;
  }

  dataValue(): NumberValue {
    return <NumberValue> {
      id: this.id(),
      type: "number",
      value: this.data()
    };
  }

  add(value: number): void {
    this._applyAdd(value, true);
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

  protected _setData(data: number): void {
    this._applySet(data, true, this.sessionId, this.username);
  }

  protected _getData(): number {
    return this._data;
  }

  private _applyAdd(value: number, local: boolean): void {
    this._validateNumber(value);

    if (value !== 0) {
      this._data += value;

      var event: NumberNodeAddEvent = new NumberNodeAddEvent(this, local, value, this.sessionId, this.username);
      this._emitValueEvent(event);
    }
  }

  private _applySet(value: number, local: boolean, sessionId: string, username: string): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
    this._data = value;

    var event: NumberNodeSetValueEvent = new NumberNodeSetValueEvent(this, local, value, this.sessionId, this.username);
    this._emitValueEvent(event);
  }

  // Handlers for incoming operations

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
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
    var operation: NumberAdd = <NumberAdd> operationEvent.operation;
    this._applyAdd(operation.value, false);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: NumberSet = <NumberSet> operationEvent.operation;
    this._applySet(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }
}

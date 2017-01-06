import {ModelNode} from "./ModelNode";
import {NumberValue, DataValueType} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {NumberNodeDeltaEvent} from "./events";
import {NumberNodeSetValueEvent} from "./events";
import {NumberAdd} from "../ot/ops/operationChanges";
import {NumberSet} from "../ot/ops/operationChanges";

export class NumberNode extends ModelNode<number> {

  public static Events: any = {
    DELTA: "delta",
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
    super(ModelElementType.NUMBER, data.id, path, model, sessionId, username);

    this._data = data.value;
  }

  public dataValue(): NumberValue {
    return <NumberValue> {
      id: this.id(),
      type: DataValueType.NUMBER,
      value: this.data()
    };
  }

  public add(value: number): void {
    this._applyAdd(value, true);
  }

  public subtract(value: number): void {
    this.add(-value);
  }

  public increment(): void {
    this.add(1);
  }

  public decrement(): void {
    this.add(-1);
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.NUMBER_ADD) {
      this._handleAddOperation(operationEvent);
    } else if (type === OperationType.NUMBER_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
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

      const event: NumberNodeDeltaEvent = new NumberNodeDeltaEvent(this, local, value, this.sessionId, this.username);
      this._emitValueEvent(event);
    }
  }

  private _applySet(value: number, local: boolean, sessionId: string, username: string): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
    this._data = value;

    const event: NumberNodeSetValueEvent =
      new NumberNodeSetValueEvent(this, local, value, this.sessionId, this.username);
    this._emitValueEvent(event);
  }

  // Handlers for incoming operations
  private _handleAddOperation(operationEvent: ModelOperationEvent): void {
    const operation: NumberAdd = <NumberAdd> operationEvent.operation;
    this._applyAdd(operation.value, false);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: NumberSet = <NumberSet> operationEvent.operation;
    this._applySet(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }
}

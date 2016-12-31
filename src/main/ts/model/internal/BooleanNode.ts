import {ModelNode} from "./ModelNode";
import {BooleanValue, DataValueType} from "../dataValue";
import {ModelElementType} from "../ModelElementType";
import {Model} from "./Model";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {BooleanNodeSetValueEvent} from "./events";
import {BooleanSet} from "../ot/ops/operationChanges";

export class BooleanNode extends ModelNode<boolean> {

  public static Events: any = {
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: boolean;

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(data: BooleanValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelElementType.Boolean, data.id, path, model, sessionId, username);
    this._data = data.value;
  }

  public dataValue(): BooleanValue {
    return <BooleanValue> {
      id: this.id(),
      type: DataValueType.BOOLEAN,
      value: this.data()
    };
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.BOOLEAN_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  //
  // private and protected methods
  //

  protected _setData(value: boolean): void {
    this._applySetValue(value, true, this.sessionId, this.username);
  }

  protected _getData(): boolean {
    return this._data;
  }

  private _applySetValue(value: boolean, local: boolean, sessionId: string, username: string): void {
    this._validateSet(value);
    this._data = value;

    const event: BooleanNodeSetValueEvent = new BooleanNodeSetValueEvent(this, local, value, sessionId, username);

    this._emitValueEvent(event);
  }

  // Handlers for incoming operations

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: BooleanSet = <BooleanSet> operationEvent.operation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateSet(value: boolean): void {
    if (typeof value !== "boolean") {
      throw new Error("Value must be a boolean");
    }
  }
}

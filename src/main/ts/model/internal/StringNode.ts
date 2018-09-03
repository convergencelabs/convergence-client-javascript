import {ModelNode} from "./ModelNode";
import {StringValue, DataValueType} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {StringNodeInsertEvent, StringNodeRemoveEvent, StringNodeSetValueEvent} from "./events";

/**
 * @hidden
 * @internal
 */
export class StringNode extends ModelNode<string> {

  public static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: string;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(data: StringValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string) {
    super(ModelElementType.STRING, data.id, path, model, sessionId, username);

    this._data = data.value;
  }

  public dataValue(): StringValue {
    return {
      id: this.id(),
      type: DataValueType.STRING,
      value: this.data()
    } as StringValue;
  }

  public toJson(): any {
    return this._data;
  }

  public insert(index: number, value: string): void {
    this._applyInsert(index, value, true, this.sessionId, this.username);
  }

  public remove(index: number, length: number): void {
    this._applyRemove(index, length, true, this.sessionId, this.username);
  }

  public length(): number {
    return this._data.length;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.STRING_INSERT) {
      this._handleInsertOperation(operationEvent);
    } else if (type === OperationType.STRING_REMOVE) {
      this._handleRemoveOperation(operationEvent);
    } else if (type === OperationType.STRING_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  protected _setData(data: string): void {
    this._applySetValue(data, true, this.sessionId, this.username);
  }

  protected _getData(): string {
    return this._data;
  }

  private _applyInsert(index: number, value: string, local: boolean, sessionId: string, username: string): void {
    this._validateInsert(index, value);

    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);

    const event: StringNodeInsertEvent = new StringNodeInsertEvent(this, local, index, value, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, length: number, local: boolean, sessionId: string, username: string): void {
    this._validateRemove(index, length);

    const removedVal: string = this._data.slice(index, index + length);
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);

    const event: StringNodeRemoveEvent = new StringNodeRemoveEvent(this, local, index, removedVal, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySetValue(value: string, local: boolean, sessionId: string, username: string): void {
    this._validateStringValue(value);
    this._data = value;

    const event: StringNodeSetValueEvent = new StringNodeSetValueEvent(this, local, value, sessionId, username);
    this._emitValueEvent(event);
  }

  //
  // Operations
  //

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringInsertOperation = operationEvent.operation as StringInsertOperation;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringRemoveOperation = operationEvent.operation as StringRemoveOperation;
    this._applyRemove(operation.index, operation.value.length, false,
      operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringSetOperation = operationEvent.operation as StringSetOperation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateInsert(index: number, value: string): void {
    // TODO: Add integer check
    if (this._data.length < index || index < 0) {
      throw new Error("Index out of bounds: " + index);
    }

    this._validateStringValue(value);
  }

  private _validateRemove(index: number, length: number): void {
    // TODO: Add integer check
    if (this._data.length < index + length || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateStringValue(value: string): void {
    if (typeof value !== "string") {
      throw new Error(`The value must be a string but was: ${typeof value}`);

    }
  }
}

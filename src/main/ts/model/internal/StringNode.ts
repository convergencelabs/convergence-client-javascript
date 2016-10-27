import {ModelNode} from "./ModelNode";
import {StringValue} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../ot/Path";
import {StringNodeInsertEvent} from "./events";
import {StringNodeRemoveEvent} from "./events";
import {StringNodeSetValueEvent} from "./events";

export class StringNode extends ModelNode<String> {

  static Events: any = {
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
    super(ModelElementType.String, data.id, path, model, sessionId, username);

    this._data = data.value;
  }

  dataValue(): StringValue {
    return <StringValue> {
      id: this.id(),
      type: "string",
      value: this.data()
    };
  }

  insert(index: number, value: string): void {
    this._applyInsert(index, value, true, this.sessionId, this.username);
  }

  remove(index: number, length: number): void {
    this._applyRemove(index, length, true, this.sessionId, this.username);
  }

  length(): number {
    return this._data.length;
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

    var event: StringNodeInsertEvent = new StringNodeInsertEvent(this, local, index, value, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, length: number, local: boolean, sessionId: string, username: string): void {
    this._validateRemove(index, length);

    let removedVal: string = this._data.slice(index, index + length);
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);

    var event: StringNodeRemoveEvent = new StringNodeRemoveEvent(this, local, index, removedVal, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySetValue(value: string, local: boolean, sessionId: string, username: string): void {
    this._validateSet(value);

    this._data = value;

    var event: StringNodeSetValueEvent = new StringNodeSetValueEvent(this, local, value, sessionId, username);
    this._emitValueEvent(event);
  }

  //
  // Operations
  //

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
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

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringInsertOperation = <StringInsertOperation> operationEvent.operation;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
    this._applyRemove(operation.index, operation.value.length, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _validateInsert(index: number, value: string): void {
    // TODO: Add integer check
    if (this._data.length < index || index < 0) {
      throw new Error("Index out of bounds: " + index);
    }

    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }

  private _validateRemove(index: number, length: number): void {
    // TODO: Add integer check
    if (this._data.length < index + length || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateSet(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }
}

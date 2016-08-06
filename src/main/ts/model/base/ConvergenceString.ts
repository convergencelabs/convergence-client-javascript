import {PathElement} from ".././ot/Path";
import {StringInsertOperation} from ".././ot/ops/StringInsertOperation";
import {StringRemoveOperation} from ".././ot/ops/StringRemoveOperation";
import {StringSetOperation} from ".././ot/ops/StringSetOperation";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {OperationType} from ".././ot/ops/OperationType";
import {StringValue} from ".././dataValue";
import {ConvergenceValue, ModelValueEvent} from "./ConvergenceValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValueType} from "./ConvergenceValueType";


export default class ConvergenceString extends ConvergenceValue<String> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: ConvergenceValue.Events.DETACHED,
    REFERENCE: ConvergenceValue.Events.REFERENCE,
    MODEL_CHANGED: ConvergenceValue.Events.MODEL_CHANGED
  };

  private _data: string;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(data: StringValue,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              model: ConvergenceModel) {
    super(ConvergenceValueType.String, data.id, parent, fieldInParent, model);

    this._data = data.value;
  }

  length(): number {
    return this._data.length;
  }


  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  protected _getValue(): string {
    return this._data;
  }

  //
  // Operations
  //

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
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
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateInsert(index, value);

    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);

    var event: StringInsertEvent = {
      src: this,
      name: ConvergenceString.Events.INSERT,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateRemove(index, value.length);

    this._data = this._data.slice(0, index) + this._data.slice(index + value.length, this._data.length);

    var event: StringRemoveEvent = {
      src: this,
      name: ConvergenceString.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
    var value: string = operation.value;

    this._validateSet(value);
    this._data = value;

    var event: StringSetValueEvent = {
      src: this,
      name: ConvergenceString.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
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

export interface StringInsertEvent extends ModelValueEvent {
  src: ConvergenceString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ModelValueEvent {
  src: ConvergenceString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ModelValueEvent {
  src: ConvergenceString;
  value:  string;
}

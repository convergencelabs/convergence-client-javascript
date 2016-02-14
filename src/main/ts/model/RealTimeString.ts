import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import StringInsertOperation from "../ot/ops/StringInsertOperation";
import StringRemoveOperation from "../ot/ops/StringRemoveOperation";
import StringSetOperation from "../ot/ops/StringSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";
import {ModelChangeEvent} from "./events";
import OperationType from "../protocol/model/OperationType";


export default class RealTimeString extends RealTimeValue<String> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeString.
   */
  constructor(private _data: string,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              _sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.String, parent, fieldInParent, _sendOpCallback);
  }

  insert(index: number, value: string): void {
    this._validateInsert(index, value);

    var operation: StringInsertOperation = new StringInsertOperation(this.path(), false, index, value);
    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);
    this._sendOperation(operation);
  }

  remove(index: number, length: number): void {
    this._validateRemove(index, length);

    var operation: StringRemoveOperation = new StringRemoveOperation(this.path(), false, index, this._data.substr(index, length));
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);
    this._sendOperation(operation);
  }

  length(): number {
    return this._data.length;
  }

  //
  // private and protected methods.
  //

  protected _setValue(value: string): void {
    this._validateSet(value);

    this._data = value;
    var operation: StringSetOperation = new StringSetOperation(this.path(), false, value);
    this._sendOperation(operation);
  }

  protected _getValue(): string {
    return this._data;
  }

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: OperationType = operationEvent.operation.type;
      if (type === OperationType.STRING_INSERT) {
        this._handleInsertOperation(operationEvent);
      } else if (type === OperationType.STRING_REMOVE) {
        this._handleRemoveOperation(operationEvent);
      } else if (type === OperationType.STRING_VALUE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      throw new Error("Invalid path: string values do not have children");
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
      name: RealTimeString.Events.INSERT,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateRemove(index, value.length);

    this._data = this._data.slice(0, index) + this._data.slice(index + value.length, this._data.length);

    var event: StringRemoveEvent = {
      src: this,
      name: RealTimeString.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
    var value: string = operation.value;

    this._validateSet(value);
    this._data = value;

    var event: StringSetValueEvent = {
      src: this,
      name: RealTimeString.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
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

export interface StringInsertEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ModelChangeEvent {
  src: RealTimeString;
  value:  string;
}

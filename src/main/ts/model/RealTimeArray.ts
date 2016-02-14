import RealTimeContainerValue from "./RealTimeContainerValue";
import RealTimeValue from "./RealTimeValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ArrayInsertOperation from "../ot/ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../ot/ops/ArrayRemoveOperation";
import ArrayReplaceOperation from "../ot/ops/ArrayReplaceOperation";
import ArrayMoveOperation from "../ot/ops/ArrayMoveOperation";
import ArraySetOperation from "../ot/ops/ArraySetOperation";
import {Path} from "../ot/Path";
import RealTimeObject from "./RealTimeObject";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import RealTimeValueFactory from "./RealTimeValueFactory";
import {ModelChangeEvent} from "./events";
import OperationType from "../protocol/model/OperationType";


export default class RealTimeArray extends RealTimeContainerValue<any[]> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED
  };

  private _children: Array<RealTimeValue<any>>;

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(data: Array<any>,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              _sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Array, parent, fieldInParent, _sendOpCallback);

    this._children = [];

    for (var i: number = 0; i < data.length; i++) {
      this._children.push(RealTimeValueFactory.create(data[i], this, i, this._sendOpCallback));
    }
  }

  get(index: number): RealTimeValue<any> {
    return this._children[index];
  }

  set(index: number, value: Object|number|string|boolean): void {
    this._validateReplace(index, value);

    var operation: ArrayReplaceOperation = new ArrayReplaceOperation(this.path(), false, index, value);
    var child: RealTimeValue<any> = this._children[index];
    this._children[index] = RealTimeValueFactory.create(value, this, index, this._sendOpCallback);
    this.updateFieldInParent(index);
    child._detach();
    this._sendOperation(operation);
  }

  insert(index: number, value: Object|number|string|boolean): void {
    this._validateInsert(index, value);

    var operation: ArrayInsertOperation = new ArrayInsertOperation(this.path(), false, index, value);
    this._children.splice(index, 0, (RealTimeValueFactory.create(value, this, index, this._sendOpCallback)));
    this.updateFieldInParent(index);
    this._sendOperation(operation);
  }

  remove(index: number): Object|number|string|boolean {
    this._validateRemove(index);

    var operation: ArrayRemoveOperation = new ArrayRemoveOperation(this.path(), false, index);
    var child: RealTimeValue<any> = this._children[index];
    var removeValue: Object|number|string|boolean = child.value();
    this._children.splice(index, 1);
    this.updateFieldInParent(index);
    child._detach();
    this._sendOperation(operation);
    return removeValue;
  }

  reorder(fromIndex: number, toIndex: number): void {
    this._validateMove(fromIndex, toIndex);

    var operation: ArrayMoveOperation = new ArrayMoveOperation(this.path(), false, fromIndex, toIndex);

    var child: RealTimeValue<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));
    this._sendOperation(operation);
  }

  push(value: any): void {
    this.insert(this._children.length, value);
  }

  pop(): any {
    return this.remove(this._children.length - 1);
  }

  unshift(value: any): void {
    this.insert(0, value);
  }

  shift(): any {
    return this.remove(0);
  }

  length(): number {
    return this._children.length;
  }

  forEach(callback: (value: RealTimeValue<any>, index?: number) => void): void {
    this._children.forEach(callback);
  }

  //
  // protected and private methods.
  //

  protected _getValue(): Array<any> {
    var returnVal: Array<any> = [];
    this.forEach((child: RealTimeValue<any>) => {
      returnVal.push(child.value());
    });
    return returnVal;
  }

  protected _setValue(values: Array<any>): void {
    this._validateSet(values);

    var operation: ArraySetOperation = new ArraySetOperation(this.path(), false, values);
    this._detachChildren();

    this._children = [];
    for (var i: number = 0; i < values.length; i++) {
      this._children.push(RealTimeValueFactory.create(values[i], this, i, this._sendOpCallback));
    }
    this._sendOperation(operation);
  }

  protected _detachChildren(): void {
    this.forEach((child: RealTimeValue<any>) => {
      child._detach();
    });
  }

  _path(pathArgs: Path): RealTimeValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var index: number = <number> pathArgs[0];
    var child: RealTimeValue<any> = this._children[index];
    if (pathArgs.length > 1) {
      if (child.type() === RealTimeValueType.Object) {
        return (<RealTimeObject> child).child(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === RealTimeValueType.Array) {
        return (<RealTimeArray> child).child(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return RealTimeValueFactory.create(undefined, null, null, this._sendOperation);
      }
    } else {
      return child;
    }
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: OperationType = operationEvent.operation.type;
      if (type === OperationType.ARRAY_INSERT) {
        this._handleInsertOperation(operationEvent);
      } else if (type === OperationType.ARRAY_REORDER) {
        this._handleReorderOperation(operationEvent);
      } else if (type === OperationType.ARRAY_REMOVE) {
        this._handleRemoveOperation(operationEvent);
      } else if (type === OperationType.ARRAY_SET) {
        this._handleSetOperation(operationEvent);
      } else if (type === OperationType.ARRAY_VALUE) {
        this._handleSetValueOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      var childPath: any = relativePath[0];
      if (typeof childPath !== "number") {
        throw new Error("Invalid path element, array indices must be a number");
      }
      var child: RealTimeValue<any> = this._children[childPath];
      if (child === undefined) {
        throw new Error("Invalid path element, child does not exist");
      }
      var subPath: Path = relativePath.slice(0);
      subPath.shift();
      child._handleRemoteOperation(subPath, operationEvent);
    }
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayInsertOperation = <ArrayInsertOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: Object|number|string|boolean = operation.value;

    this._validateInsert(index, value);

    this._children.splice(index, 0, (RealTimeValueFactory.create(value, this, index, this._sendOperation)));
    this.updateFieldInParent(index);

    var event: ArrayInsertEvent = {
      src: this,
      name: RealTimeArray.Events.INSERT,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
    var fromIndex: number = operation.fromIndex;
    var toIndex: number = operation.toIndex;

    this._validateMove(fromIndex, toIndex);

    var child: RealTimeValue<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));

    var event: ArrayReorderEvent = {
      src: this,
      name: RealTimeArray.Events.REORDER,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      fromIndex: fromIndex,
      toIndex: toIndex
    };
    this.emitEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
    var index: number = operation.index;

    this._validateRemove(index);

    var child: RealTimeValue<any> = this._children[index];
    this._children.splice(index, 1);
    this.updateFieldInParent(index);

    child._detach();

    var event: ArrayRemoveEvent = {
      src: this,
      name: RealTimeArray.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index
    };
    this.emitEvent(event);

  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: Object|number|string|boolean = operation.value;

    this._validateReplace(index, value);

    var child: RealTimeValue<any> = this._children[index];
    this._children[index] = RealTimeValueFactory.create(value, this, index, this._sendOperation);
    this.updateFieldInParent(index);

    child._detach();

    var event: ArraySetEvent = {
      src: this,
      name: RealTimeArray.Events.SET,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
    var values: Array<Object|number|string|boolean> = operation.value;

    this._validateSet(values);

    var oldChildren: Array<RealTimeValue<any>> = this._children;
    this._children = [];
    for (var i: number = 0; i < values.length; i++) {
      this._children.push(RealTimeValueFactory.create(values[i], this, i, this._sendOperation));
    }

    oldChildren.forEach((oldChild: RealTimeValue<any>) => oldChild._detach());

    var event: ArraySetValueEvent = {
      src: this,
      name: RealTimeArray.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: values
    };
    this.emitEvent(event);
  }

  // Private Validation Methods

  private _validateInsert(index: number, value: Object|number|string|boolean): void {
    // TODO: Add integer check
    if (this._children.length < index || index < 0) {
      throw new Error("Index out of bounds!");
    }

    if (typeof value === 'undefined' || typeof value === 'function') {
      throw new Error("Invalid value for insert!");
    }
  }

  private _validateMove(fromIndex: number, toIndex: number): void {
    // TODO: Add integer check
    if (this._children.length <= fromIndex || fromIndex < 0 || this._children.length <= toIndex || toIndex < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateRemove(index: number): void {
    // TODO: Add integer check
    if (this._children.length <= index || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateReplace(index: number, value: Object|number|string|boolean): void {
    // TODO: Add integer check
    if (this._children.length <= index || index < 0) {
      throw new Error("Index out of bounds!");
    }

    if (typeof value === 'undefined' || typeof value === 'function') {
      throw new Error("Illegal argument!");
    }
  }

  private _validateSet(values: Array<Object|number|string|boolean>): void {
    if (!Array.isArray(values)) {
      throw new Error("Illegal argument!");
    }
  }

  // Private Functions
  /**
   * Update fieldInParent for all children.
   * @param {number} start
   */
  private updateFieldInParent(start: number): void {
    for (var i: number = start; i < this._children.length; i++) {
      var child: RealTimeValue<any> = this._children[i];
      child.fieldInParent = i;
    }
  }
}

export interface ArrayInsertEvent extends ModelChangeEvent {
  index: number;
  value: any;
}

export interface ArrayRemoveEvent extends ModelChangeEvent {
  index: number;
}

export interface ArraySetEvent extends ModelChangeEvent {
  index: number;
  value: any;
}

export interface ArrayReorderEvent extends ModelChangeEvent {
  fromIndex: number;
  toIndex: any;
}

export interface ArraySetValueEvent extends ModelChangeEvent {
  value: Array<any>;
}

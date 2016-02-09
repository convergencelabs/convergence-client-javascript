import RealTimeContainer from "./RealTimeContainerValue";
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
import ArrayInsertEvent from "./events/ArrayInsertEvent";
import ArrayMoveEvent from "./events/ArrayMoveEvent";
import ArrayRemoveEvent from "./events/ArrayRemoveEvent";
import ArrayReplaceEvent from "./events/ArrayReplaceEvent";
import ArraySetEvent from "./events/ArraySetEvent";
import ModelOperationEvent from "./ModelOperationEvent";
import DataType from "./DataType";
import RealTimeValueFactory from "./RealTimeValueFactory";


export default class RealTimeArray extends RealTimeContainer {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    REPLACE: "replace",
    REORDER: "reorder",
    SET: "set"
  };

  private _children: Array<RealTimeValue>;

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(data: Array<any>,
              parent: RealTimeContainer,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(DataType.Array, parent, fieldInParent, sendOpCallback);

    this._children = new Array<RealTimeValue>();

    for (var i: number = 0; i < data.length; i++) {
      this._children.push(RealTimeValueFactory.create(data[i], this, i, this.sendOpCallback));
    }
  }

  /**
   * Inserts a value into the RealTimeArray
   * @param {number} index - The index to insert
   * @param {Object|number|string|boolean} value - The value to insert
   */
  insert(index: number, value: Object|number|string|boolean): void {
    this._validateInsert(index, value);

    var operation: ArrayInsertOperation = new ArrayInsertOperation(this.path(), false, index, value);
    this._children.splice(index, 0, (RealTimeValueFactory.create(value, this, index, this.sendOpCallback)));
    this.updateFieldInParent(index);
    this.sendOpCallback(operation);
  }

  /**
   * Removes the value at an index in the RealTimeArray.
   * @param {number} index The index of the value to remove.
   * @returns {Object|number|string|boolean} The removed value, if any
   */
  remove(index: number): Object|number|string|boolean {
    this._validateRemove(index);

    var operation: ArrayRemoveOperation = new ArrayRemoveOperation(this.path(), false, index);
    var child: RealTimeValue = this._children[index];
    var removeValue: Object|number|string|boolean = child.value();
    this._children.splice(index, 1);
    this.updateFieldInParent(index);
    child._setDetached();
    this.sendOpCallback(operation);
    return removeValue;
  }

  /**
   * Replaces the value at an index in the RealTimeArray.
   * @param {number} index The index to replace
   * @param {Object|number|string|boolean} value The new value
   */
  replace(index: number, value: Object|number|string|boolean): void {
    this._validateReplace(index, value);

    var operation: ArrayReplaceOperation = new ArrayReplaceOperation(this.path(), false, index, value);
    var child: RealTimeValue = this._children[index];
    this._children[index] = RealTimeValueFactory.create(value, this, index, this.sendOpCallback);
    this.updateFieldInParent(index);
    child._setDetached();
    this.sendOpCallback(operation);
  }

  /**
   * Moves a value at one index to a different index in the RealTimeArray.
   * @param {number} fromIndex The index to move the value from.
   * @param {number} toIndex The index to move the value to.
   */
  reorder(fromIndex: number, toIndex: number): void {
    this._validateMove(fromIndex, toIndex);

    var operation: ArrayMoveOperation = new ArrayMoveOperation(this.path(), false, fromIndex, toIndex);

    var child: RealTimeValue = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));
    this.sendOpCallback(operation);
  }

  /**
   * Replaces all children in the RealTimeArray with the new values.
   * @param {Array} values The new values for the RealTimeArray.
   */
  setValue(values: Array<Object|number|string|boolean>): void {
    this._validateSet(values);

    var operation: ArraySetOperation = new ArraySetOperation(this.path(), false, values);
    this._detachChildren();

    this._children = new Array<RealTimeValue>();
    for (var i: number = 0; i < values.length; i++) {
      this._children.push(RealTimeValueFactory.create(values[i], this, i, this.sendOpCallback));
    }
    this.sendOpCallback(operation);
  }

  /**
   * Adds a value to the end of the RealTimeArray.
   * @param {Object|number|string|boolean} value The value to add.
   */
  push(value: any): void {
    this.insert(this._children.length, value);
  }

  /**
   * Removes the value at the end of this RealTimeArray and returns it.
   * @return {Object|number|string|boolean} The value
   */
  pop(): any {
    return this.remove(this._children.length - 1);
  }

  /**
   * Inserts a value at the beginning of the RealTimeArray.
   * @param {Object|number|string|boolean} value The value to insert.
   */
  unshift(value: any): void {
    this.insert(0, value);
  }

  /**
   * Removes the value at the beginning of this RealTimeArray.
   * @returns {Object|number|string|boolean} The removed value
   */
  shift(): any {
    return this.remove(0);
  }

  /**
   * Performs the specified action for each element in an array.
   * @param callback  A function that accepts RealTimeValue. forEach calls the callback function one time for each element in the array.
   */
  forEach(callback: (value: RealTimeValue, index?: number) => void): void {
    this._children.forEach(callback);
  }

  /**
   * Returns the length of the RealTimeArray
   * @return {number} The length
   */
  length(): number {
    return this._children.length;
  }

  /**
   * Returns a RealTimeValue representing the child of this array at the path specified by
   * pathArgs. Because this class represents an array, the first instance of pathArgs
   * must be an integer. All arguments must be either  strings or integers, dependent
   * on whether the RealTimeValue at that path level is a RealTimeObject or a RealTimeArray.
   * @param {...string|number} pathArgs Array of path arguments.
   * @returns {convergence.model.RealTimeValue}
   */
  // TODO: Determine correct parameter
  child(pathArgs: any): RealTimeValue {
    // We're letting them pass in individual path arguments or a single array of path arguments
    var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
    if (pathArgsForReal.length === 0) {
      throw new Error("Must at least specify the child index in the path");
    }
    var index: number = <number> pathArgsForReal[0];
    var child: RealTimeValue = this._children[index];
    if (pathArgsForReal.length > 1) {
      if (child.type() === DataType.Object) {
        return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
      } else if (child.type() === DataType.Array) {
        return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return RealTimeValueFactory.create(undefined, null, null, this.sendOpCallback);
      }
    } else {
      return child;
    }
  }

  get(index: number): RealTimeValue {
    return this._children[index];
  }

  value(): Array<any> {
    var returnVal: Array<any> = [];
    this.forEach((child: RealTimeValue) => {
      returnVal.push(child.value());
    });
    return returnVal;
  }

  protected _detachChildren(): void {
    this.forEach((child: RealTimeValue) => {
      child._setDetached();
    });
  }

  // Handlers for incoming operations

  _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === ArrayInsertOperation.TYPE) {
      this._handleInsertOperation(operationEvent);
    } else if (type === ArrayMoveOperation.TYPE) {
      this._handleMoveOperation(operationEvent);
    } else if (type === ArrayRemoveOperation.TYPE) {
      this._handleRemoveOperation(operationEvent);
    } else if (type === ArrayReplaceOperation.TYPE) {
      this._handleReplaceOperation(operationEvent);
    } else if (type === ArraySetOperation.TYPE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayInsertOperation = <ArrayInsertOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: Object|number|string|boolean = operation.value;

    this._validateInsert(index, value);

    this._children.splice(index, 0, (RealTimeValueFactory.create(value, this, index, this.sendOpCallback)));
    this.updateFieldInParent(index);

    var event: ArrayInsertEvent = new ArrayInsertEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      index,
      value);
    this.emit(RealTimeArray.Events.INSERT, event);
  }

  private _handleMoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
    var fromIndex: number = operation.fromIndex;
    var toIndex: number = operation.toIndex;

    this._validateMove(fromIndex, toIndex);

    var child: RealTimeValue = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));

    var event: ArrayMoveEvent = new ArrayMoveEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      fromIndex,
      toIndex);
    this.emit(RealTimeArray.Events.REORDER, event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
    var index: number = operation.index;

    this._validateRemove(index);

    var child: RealTimeValue = this._children[index];
    this._children.splice(index, 1);
    this.updateFieldInParent(index);

    var event: ArrayRemoveEvent = new ArrayRemoveEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      index);
    this.emit(RealTimeArray.Events.REMOVE, event);
    child._setDetached();
  }

  private _handleReplaceOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: Object|number|string|boolean = operation.value;

    this._validateReplace(index, value);

    var child: RealTimeValue = this._children[index];
    this._children[index] = RealTimeValueFactory.create(value, this, index, this.sendOpCallback);
    this.updateFieldInParent(index);

    var event: ArrayReplaceEvent = new ArrayReplaceEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      index,
      value);
    this.emit(RealTimeArray.Events.REPLACE, event);
    child._setDetached();
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
    var values: Array<Object|number|string|boolean> = operation.value;

    this._validateSet(values);

    var oldChildren: Array<RealTimeValue> = this._children;
    this._children = new Array<RealTimeValue>();
    for (var i: number = 0; i < values.length; i++) {
      this._children.push(RealTimeValueFactory.create(values[i], this, i, this.sendOpCallback));
    }

    var event: ArraySetEvent = new ArraySetEvent(
      operationEvent.sessionId,
      operationEvent.username,
      operationEvent.version,
      operationEvent.timestamp,
      this,
      values);
    this.emit(RealTimeArray.Events.SET, event);
    oldChildren.forEach((oldChild: RealTimeValue) => oldChild._setDetached());
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
      var child: RealTimeValue = this._children[i];
      child.fieldInParent = i;
    }
  }
}

/// <reference path="RealTimeContainer.ts" />
/// <reference path="../ot/ops/ArrayInsertOperation.ts" />
/// <reference path="../ot/ops/ArrayRemoveOperation.ts" />
/// <reference path="../ot/ops/ArrayReplaceOperation.ts" />
/// <reference path="../ot/ops/ArrayMoveOperation.ts" />
/// <reference path="../ot/ops/ArraySetOperation.ts" />
/// <reference path="events/ArrayInsertEvent.ts" />
/// <reference path="events/ArrayRemoveEvent.ts" />
/// <reference path="events/ArrayMoveEvent.ts" />
/// <reference path="events/ArrayReplaceEvent.ts" />
/// <reference path="events/ArraySetEvent.ts" />

module convergence.model {

  import ArrayInsertOperation = convergence.ot.ArrayInsertOperation;
  import ArrayRemoveOperation = convergence.ot.ArrayRemoveOperation;
  import ArraySetOperation = convergence.ot.ArraySetOperation;
  import ArrayReplaceOperation = convergence.ot.ArrayReplaceOperation;
  import ArrayMoveOperation = convergence.ot.ArrayMoveOperation;

  import ArrayInsertEvent = convergence.model.event.ArrayInsertEvent;
  import ArrayRemoveEvent = convergence.model.event.ArrayRemoveEvent;
  import ArrayMoveEvent = convergence.model.event.ArrayMoveEvent;
  import ArrayReplaceEvent = convergence.model.event.ArrayReplaceEvent;
  import ArraySetEvent = convergence.model.event.ArraySetEvent;
  import DiscreteOperation = convergence.ot.DiscreteOperation;

  enum Events {Insert, Move, Remove, Replace, Set}


  export class RealTimeArray extends RealTimeContainer {

    private _children: Array<RealTimeData>;

    /**
     * Constructs a new RealTimeArray.
     */
    constructor(data: Array<any>,
                parent: RealTimeContainer,
                fieldInParent: PathElement,
                sendOpCallback: (operation: DiscreteOperation) => void) {
      super(DataType.Array, parent, fieldInParent, sendOpCallback);

      this._children = new Array<RealTimeData>();

      for (var i: number = 0; i < data.length; i++) {
        this._children.push(RealTimeData.create(data[i], this, i, this.sendOpCallback));
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
      this._children.splice(index, 0, (RealTimeData.create(value, this, index, this.sendOpCallback)));
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
      var child: RealTimeData = this._children[index];
      this._children.splice(index, 1);
      this.updateFieldInParent(index);
      // TODO: detach
      this.sendOpCallback(operation);
      return child.value();
    }

    /**
     * Replaces the value at an index in the RealTimeArray.
     * @param {number} index The index to replace
     * @param {Object|number|string|boolean} value The new value
     */
    replace(index: number, value: Object|number|string|boolean): void {
      this._validateReplace(index, value);

      var operation: ArrayReplaceOperation = new ArrayReplaceOperation(this.path(), false, index, value);
      this._children[index] = RealTimeData.create(value, this, index, this.sendOpCallback);
      this.updateFieldInParent(index);
      // TODO: detach
      this.sendOpCallback(operation);
    }

    /**
     * Moves a value at one index to a different index in the RealTimeArray.
     * @param {number} fromIndex The index to move the value from.
     * @param {number} toIndex The index to move the value to.
     */
    move(fromIndex: number, toIndex: number): void {
      this._validateMove(fromIndex, toIndex);

      var operation: ArrayMoveOperation = new ArrayMoveOperation(this.path(), false, fromIndex, toIndex);

      var child: RealTimeData = this._children[fromIndex];
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
      // TODO: detach
      this._children = new Array<RealTimeData>();
      for (var i: number = 0; i < values.length; i++) {
        this._children.push(RealTimeData.create(values[i], this, i, this.sendOpCallback));
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
     * @param callback  A function that accepts RealTimeData. forEach calls the callback function one time for each element in the array.
     */
    forEach(callback: (value: RealTimeData, index?: number) => void): void {
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
     * Returns a RealTimeData representing the child of this array at the path specified by
     * pathArgs. Because this class represents an array, the first instance of pathArgs
     * must be an integer. All arguments must be either  strings or integers, dependent
     * on whether the RealTimeData at that path level is a RealTimeObject or a RealTimeArray.
     * @param {...string|number} pathArgs Array of path arguments.
     * @returns {convergence.model.RealTimeData}
     */
    // TODO: Determine correct parameter
    child(pathArgs: any): RealTimeData {
      // We're letting them pass in individual path arguments or a single array of path arguments
      var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
      if (pathArgsForReal.length === 0) {
        throw new Error("Must at least specify the child index in the path");
      }
      var index: number = <number> pathArgsForReal[0];
      var child: RealTimeData = this._children[index];
      if (pathArgsForReal.length > 1) {
        if (child.type() === DataType.Object) {
          return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else if (child.type() === DataType.Array) {
          return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else {
          // TODO: Determine correct way to handle undefined
          return RealTimeData.create(undefined, null, null, this.sendOpCallback);
        }
      } else {
        return child;
      }
    }

    get(index: number): RealTimeData {
      return this._children[index];
    }

    value(): Array<any> {
      var returnVal: Array<any> = [];
      this.forEach((child: RealTimeData) => {
        returnVal.push(child.value());
      });
      return returnVal;
    }

    // Handlers for incoming operations

    protected _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
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

      this._children.splice(index, 0, (RealTimeData.create(value, this, index, this.sendOpCallback)));
      this.updateFieldInParent(index);

      var event: ArrayInsertEvent = new ArrayInsertEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          index,
          value);
      this.emit(Events[Events.Insert], event);
    }

    private _handleMoveOperation(operationEvent: ModelOperationEvent): void {
      var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
      var fromIndex: number = operation.fromIndex;
      var toIndex: number = operation.toIndex;

      this._validateMove(fromIndex, toIndex);

      var child: RealTimeData = this._children[fromIndex];
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
      this.emit(Events[Events.Move], event);
    }

    private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
      var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
      var index: number = operation.index;

      this._validateRemove(index);

      var child: RealTimeData = this._children[index];
      this._children.splice(index, 1);
      this.updateFieldInParent(index);
      // TODO: detach

      var event: ArrayRemoveEvent = new ArrayRemoveEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          index);
      this.emit(Events[Events.Remove], event);
    }

    private _handleReplaceOperation(operationEvent: ModelOperationEvent): void {
      var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
      var index: number = operation.index;
      var value: Object|number|string|boolean = operation.value;

      this._validateReplace(index, value);

      this._children[index] = RealTimeData.create(value, this, index, this.sendOpCallback);
      this.updateFieldInParent(index);
      // TODO: detach

      var event: ArrayReplaceEvent = new ArrayReplaceEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          index,
          value);
      this.emit(Events[Events.Replace], event);
    }

    private _handleSetOperation(operationEvent: ModelOperationEvent): void {
      var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
      var values: Array<Object|number|string|boolean> = operation.value;

      this._validateSet(values);

      // TODO: detach
      this._children = new Array<RealTimeData>();
      for (var i: number = 0; i < values.length; i++) {
        this._children.push(RealTimeData.create(values[i], this, i, this.sendOpCallback));
      }

      var event: ArraySetEvent = new ArraySetEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          values);
      this.emit(Events[Events.Set], event);
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
        var child: RealTimeData = this._children[i];
        child.fieldInParent = i;
      }
    }
  }
}

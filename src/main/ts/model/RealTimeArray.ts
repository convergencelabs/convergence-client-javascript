/// <reference path="../ot/ops/ArrayInsertOperation.ts" />
/// <reference path="../ot/ops/ArrayRemoveOperation.ts" />
/// <reference path="../ot/ops/ArrayReplaceOperation.ts" />
/// <reference path="../ot/ops/ArrayMoveOperation.ts" />
/// <reference path="../ot/ops/ArraySetOperation.ts" />

module convergence.model {

  import ArrayInsertOperation = convergence.ot.ArrayInsertOperation;
  import ArrayRemoveOperation = convergence.ot.ArrayRemoveOperation;
  import ArraySetOperation = convergence.ot.ArraySetOperation;
  import ArrayReplaceOperation = convergence.ot.ArrayReplaceOperation;
  import ArrayMoveOperation = convergence.ot.ArrayMoveOperation;

  export class RealTimeArray extends Model {

    private _children: Array<Model>;

    /**
     * Constructs a new RealTimeArray.
     */
    constructor(data: Array<any>, parent: Model, fieldInParent: string|number) {
      super(ModelType.Array, parent, fieldInParent);

      this._children = new Array<Model>();

      for (var i: number = 0; i < data.length; i++) {
        this._children.push(Model.createModel(data[i], this, i));
      }
    }

    /**
     * Inserts a value into the RealTimeArray
     * @param {number} index - The index to insert
     * @param {Object|number|string|boolean} value - The value to insert
     */
    insert(index: number, value: any): void {
      // TODO: Add integer check
      if (this._children.length < index || index < 0) {
        throw new Error("Index out of bounds!");
      }

      if (typeof value === 'undefined' || typeof value === 'function') {
        throw new Error("Illegal argument!");
      }

      var operation = new ArrayInsertOperation(this.path(), false, index, value);
      this._children.splice(index, 0, (Model.createModel(value, this, index)));
      this.updateFieldInParent(index);
      // TODO: send operation
    }

    /**
     * Removes the value at an index in the RealTimeArray.
     * @param {number} index The index of the value to remove.
     * @returns {Object|number|string|boolean} The removed value, if any
     */
    remove(index: number): any {
      // TODO: Add integer check
      if (this._children.length <= index || index < 0) {
        throw new Error("Index out of bounds!");
      }

      var operation = new ArrayRemoveOperation(this.path(), false, index);
      var child: Model = this._children[index];
      this._children.splice(index, 1);
      // TODO: detach
      // TODO: send operation
      return child.value();
    }

    /**
     * Replaces the value at an index in the RealTimeArray.
     * @param {number} index The index to replace
     * @param {Object|number|string|boolean} value The new value
     */
    replace(index: number, value: Object|number|string|boolean): void {
      // TODO: Add integer check
      if (this._children.length <= index || index < 0) {
        throw new Error("Index out of bounds!");
      }

      if (typeof value === 'undefined' || typeof value === 'function') {
        throw new Error("Illegal argument!");
      }

      var operation = new ArrayReplaceOperation(this.path(), false, index, value);
      this._children[index] = Model.createModel(value, this, index);
      this.updateFieldInParent(index);
      // TODO: detach
      // TODO: send operation
    }

    /**
     * Moves a value at one index to a different index in the RealTimeArray.
     * @param {number} fromIndex The index to move the value from.
     * @param {number} toIndex The index to move the value to.
     */
    move(fromIndex: number, toIndex: number): void {
      // TODO: Add integer check
      if (this._children.length <= fromIndex || fromIndex < 0 || this._children.length <= toIndex || toIndex < 0) {
        throw new Error("Index out of bounds!");
      }

      var operation = new ArrayMoveOperation(this.path(), false, fromIndex, toIndex);

      var child: Model = this._children[fromIndex];
      this._children.splice(fromIndex, 1);
      this._children.splice(toIndex, 0, child);

      this.updateFieldInParent(Math.min(fromIndex, toIndex));
      // TODO: send operation
    }

    /**
     * Replaces all children in the RealTimeArray with the new values.
     * @param {Array} values The new values for the RealTimeArray.
     */
    setValue(values: Array<any>): void {
      if (!Array.isArray(values)) {
        throw new Error("Illegal argument!");
      }

      var operation = new ArraySetOperation(this.path(), false, values);
      // TODO: detach
      this._children = new Array<Model>();
      for (var i: number = 0; i < values.length; i++) {
        this._children.push(Model.createModel(values[i], this, i));
      }
      // TODO: send operation
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
     * @param callback  A function that accepts a Model. forEach calls the callback function one time for each element in the array.
     */
    forEach(callback: (value: Model, index: number) => void): void {
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
     * Returns a Model representing the child of this array at the path specified by
     * pathArgs. Because this class represents an array, the first instance of pathArgs
     * must be an integer. All arguments must be either  strings or integers, dependent
     * on whether the model at that path level is an RealTimeObject or an RealTimeArray.
     * @param {...string|number} pathArgs Array of path arguments.
     * @returns {convergence.model.Model}
     */
    // TODO: Determine correct parameter
    child(pathArgs: any): Model {
      // We're letting them pass in individual path arguments or a single array of path arguments
      var pathArgsForReal: Array<string|number> = Array.isArray(pathArgs) ? pathArgs : arguments;
      if (pathArgsForReal.length === 0) {
        throw new Error("Must at least specify the child index in the path");
      }
      var index: number = <number> pathArgsForReal[0];
      var child: Model = this._children[index];
      if (pathArgsForReal.length > 1) {
        if (child.getType() === ModelType.Object) {
          return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else if (child.getType() === ModelType.Array) {
          return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else {
          // TODO: Determine correct way to handle undefined
          return Model.createModel(undefined, null, null);
        }
      } else {
        return child;
      }
    }


    // Should be module protected


    // Private Functions
    /**
     * Update fieldInParent for all children.
     * @param {number} start
     */
    private updateFieldInParent(start: number): void {
      for (var i: number = start; i < this._children.length; i++) {
        var child: Model = this._children[i];
        child.fieldInParent = i;
      }
    }
  }
}

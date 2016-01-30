module convergence.model {

  import ObjectSetPropertyOperation = convergence.ot.ObjectSetPropertyOperation;
  import ObjectAddPropertyOperation = convergence.ot.ObjectAddPropertyOperation;
  import Operation = convergence.ot.Operation;
  import ObjectRemovePropertyOperation = convergence.ot.ObjectRemovePropertyOperation;
  import ObjectSetOperation = convergence.ot.ObjectSetOperation;
  export class RealTimeObject extends RealTimeData {

    private _children: Object;

    /**
     * Constructs a new RealTimeObject.
     */
    constructor(data: any, parent: RealTimeData, fieldInParent: string|number) {
      super(DataType.Object, parent, fieldInParent);

      this._children = {};

      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          this._children[prop] = RealTimeData.createModel(data[prop], this, prop);
        }
      }
    }

    /**
     * Sets a property for the RealTimeObject
     * @param {string} property - The property to set
     * @param {Object|number|string|boolean} value - The value of the property
     */
    setProperty(property: string, value: Object|number|string|boolean): void {

      var operation: Operation;
      if (this._children.hasOwnProperty(property)) {
        operation = new ObjectSetPropertyOperation(this.path(), false, property, value);
        // TODO: detach
      } else {
        operation = new ObjectAddPropertyOperation(this.path(), false, property, value);
      }

      this._children[property] = RealTimeData.createModel(value, this, property);
      // TODO: send operation
    }

    /**
     * Removes a property from the RealTimeObject
     * @param {string} property - The property
     */
    removeProperty(property: string): void {
      if (!this._children.hasOwnProperty(property)) {
        throw new Error("Cannot remove property that is undefined!");
      }
      var operation = new ObjectRemovePropertyOperation(this.path(), false, property);

      // TODO: detach
      delete this._children[property];
      // TODO: send operation
    }

    /**
     * Sets the value of the RealTimeObject.
     * @param {Object} value Must be an Object.
     */
    setValue(value: Object): void {
      if (!value || typeof value !== "object") {
        throw new Error("Value must be an object and cannot be null or undefined!")
      }

      var operation = new ObjectSetOperation(this.path(), false, value);

      // TODO: detach all children

      this._children = {};

      for (var prop in value) {
        if (value.hasOwnProperty(prop)) {
          this._children[prop] = RealTimeData.createModel(value[prop], this, prop);
        }
      }
    }

    /**
     * Checks for the existence of a property.
     * @param {string} property The propety.
     * @returns {boolean} true if the property exists, false otherwise.
     */
    hasProperty(property: string): boolean {
      return this._children.hasOwnProperty(property);
    }

    /**
     * Returns a RealTimeData representing the child of this object at the path specified by
     * pathArgs. Because this class represents an object, the first instance of pathArgs
     * must be a string. All arguments must be either  strings or integers, dependent
     * on whether the RealTimeData at that path level is an RealTimeObject or an RealTimeArray.
     * @param {...string|number} pathArgs Array of path arguments.
     * @returns {convergence.model.RealTimeData}
     */
    child(pathArgs: any): RealTimeData {
      // We're letting them pass in individual path arguments or a single array of path arguments
      var pathArgsForReal: Array<string|number> = Array.isArray(pathArgs) ? pathArgs : arguments;
      if (pathArgsForReal.length === 0) {
        throw new Error("Must at least specify the child index in the path");
      }
      var prop: string = <string> pathArgsForReal[0];
      var child: RealTimeData = this._children[prop];
      if (pathArgsForReal.length > 1) {
        if (child.getType() === DataType.Object) {
          return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else if (child.getType() === DataType.Array) {
          return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else {
          // TODO: Determine correct way to handle undefined
          return RealTimeData.createModel(undefined, null, null);
        }
      } else {
        return child;
      }
    }

    /**
     * Performs the specified action for each property in the RealTimeObject.
     * @param callback  A function that accepts a RealTimeData. forEach calls the callback function one time for each property.
     */
    forEach(callback: (model: RealTimeData) => void): void {
      for (var property in this._children) {
        if (this._children.hasOwnProperty(property)) {
          callback(this._children[property]);
        }
      }
    }
  }
}


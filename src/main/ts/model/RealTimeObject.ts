/// <reference path="RealTimeContainer.ts" />
/// <reference path="../ot/ops/ObjectSetPropertyOperation.ts" />
/// <reference path="../ot/ops/ObjectAddPropertyOperation.ts" />
/// <reference path="../ot/ops/ObjectRemovePropertyOperation.ts" />
/// <reference path="../ot/ops/ObjectSetOperation.ts" />
/// <reference path="events/ObjectSetPropertyEvent.ts" />
/// <reference path="events/ObjectRemovePropertyEvent.ts" />
/// <reference path="events/ObjectSetEvent.ts" />

module convergence.model {

  import ObjectSetPropertyOperation = convergence.ot.ObjectSetPropertyOperation;
  import ObjectAddPropertyOperation = convergence.ot.ObjectAddPropertyOperation;
  import ObjectRemovePropertyOperation = convergence.ot.ObjectRemovePropertyOperation;
  import ObjectSetOperation = convergence.ot.ObjectSetOperation;

  import Operation = convergence.ot.Operation;

  import ObjectSetPropertyEvent = convergence.model.event.ObjectSetPropertyEvent;
  import ObjectRemovePropertyEvent = convergence.model.event.ObjectRemovePropertyEvent;
  import ObjectSetEvent = convergence.model.event.ObjectSetEvent;

  enum Events {SetProperty, RemoveProperty, Set}

  export class RealTimeObject extends RealTimeContainer {

    private _children: Object;

    /**
     * Constructs a new RealTimeObject.
     */
    constructor(data: any, parent: RealTimeContainer, fieldInParent: PathElement) {
      super(DataType.Object, parent, fieldInParent);

      this._children = {};

      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          this._children[prop] = RealTimeData.create(data[prop], this, prop);
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

      this._children[property] = RealTimeData.create(value, this, property);
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

      var operation: ObjectSetOperation = new ObjectSetOperation(this.path(), false, value);

      // TODO: detach all children

      this._children = {};

      for (var prop in value) {
        if (value.hasOwnProperty(prop)) {
          this._children[prop] = RealTimeData.create(value[prop], this, prop);
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
      var pathArgsForReal: Path = Array.isArray(pathArgs) ? pathArgs : arguments;
      if (pathArgsForReal.length === 0) {
        throw new Error("Must at least specify the child index in the path");
      }
      var prop: string = <string> pathArgsForReal[0];
      var child: RealTimeData = this._children[prop];
      if (pathArgsForReal.length > 1) {
        if (child.type() === DataType.Object) {
          return (<RealTimeObject> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else if (child.type() === DataType.Array) {
          return (<RealTimeArray> child).child(pathArgsForReal.slice(1, pathArgsForReal.length));
        } else {
          // TODO: Determine correct way to handle undefined
          return RealTimeData.create(undefined, null, null);
        }
      } else {
        return child;
      }
    }

    /**
     * Performs the specified action for each property in the RealTimeObject.
     * @param callback  A function that accepts a RealTimeData. forEach calls the callback function one time for each property.
     */
    forEach(callback: (model: RealTimeData, property?: string) => void): void {
      for (var property in this._children) {
        if (this._children.hasOwnProperty(property)) {
          callback(this._children[property], property);
        }
      }
    }

    value(): Object {
      var returnObject: Object = {};
      this.forEach((model: RealTimeData, property: string) => {
        returnObject[property] = model.value();
      });
      return returnObject;
    }

    // Handlers for incoming operations

    _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
      var type: string = operationEvent.operation.type;
      if (type === ObjectAddPropertyOperation.TYPE) {
        this._handleAddPropertyOperation(operationEvent);
      } else if (type === ObjectSetPropertyOperation.TYPE) {
        this._handleSetPropertyOperation(operationEvent);
      } else if (type === ObjectRemovePropertyOperation.TYPE) {
        this._handleRemovePropertyOperation(operationEvent);
      } else if (type === ObjectSetOperation.TYPE) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    }

    private _handleAddPropertyOperation(operationEvent: ModelOperationEvent): void {
      var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
      var property: string = operation.prop;
      var value: Object|number|string|boolean = operation.value;

      var child: RealTimeData = this._children[property];
      if (child) {
        // TODO: handle detached
      }

      this._children[property] = RealTimeData.create(value, this, property);

      var event: ObjectSetPropertyEvent = new ObjectSetPropertyEvent(
        operationEvent.sessionId,
        operationEvent.username,
        operationEvent.version,
        operationEvent.timestamp,
        this,
        property,
        value);
      this.emit(Events[Events.SetProperty], event);
    }

    private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
      var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
      var property: string = operation.prop;
      var value: Object|number|string|boolean = operation.value;

      var child: RealTimeData = this._children[property];
      if (child) {
        // TODO: handle detached
      }

      this._children[property] = RealTimeData.create(value, this, property);

      var event: ObjectSetPropertyEvent = new ObjectSetPropertyEvent(
        operationEvent.sessionId,
        operationEvent.username,
        operationEvent.version,
        operationEvent.timestamp,
        this,
        property,
        value);
      this.emit(Events[Events.SetProperty], event);
    }

    private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
      var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
      var property: string = operation.prop;

      var child: RealTimeData = this._children[property];
      if (child) {
        // TODO: handle detached

        delete this._children[property];

        var event: ObjectRemovePropertyEvent = new ObjectRemovePropertyEvent(
          operationEvent.sessionId,
          operationEvent.username,
          operationEvent.version,
          operationEvent.timestamp,
          this,
          property);
        this.emit(Events[Events.SetProperty], event);
      }
    }

    private _handleSetOperation(operationEvent: ModelOperationEvent): void {
      var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
      var value: Object = operation.value;

      // TODO: detach all children

      this._children = {};

      for (var prop in value) {
        if (value.hasOwnProperty(prop)) {
          this._children[prop] = RealTimeData.create(value[prop], this, prop);
        }
      }

      var event: ObjectSetEvent = new ObjectSetEvent(
        operationEvent.sessionId,
        operationEvent.username,
        operationEvent.version,
        operationEvent.timestamp,
        this,
        value);
      this.emit(Events[Events.Set], event);
    }


  }
}


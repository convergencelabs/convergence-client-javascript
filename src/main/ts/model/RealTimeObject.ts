import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import RealTimeValue from "./RealTimeValue";
import ObjectSetPropertyOperation from "../ot/ops/ObjectSetPropertyOperation";
import ObjectAddPropertyOperation from "../ot/ops/ObjectAddPropertyOperation";
import ObjectRemovePropertyOperation from "../ot/ops/ObjectRemovePropertyOperation";
import ObjectSetOperation from "../ot/ops/ObjectSetOperation";
import {Path} from "../ot/Path";
import RealTimeArray from "./RealTimeArray";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import RealTimeValueFactory from "./RealTimeValueFactory";
import {ModelChangeEvent} from "./events";
import OperationType from "../protocol/model/OperationType";
import Operation from "../ot/ops/Operation";

export default class RealTimeObject extends RealTimeContainerValue<{ [key: string]: any; }> {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED
  };

  private _children: { [key: string]: RealTimeValue<any>; };

  /**
   * Constructs a new RealTimeObject.
   */
  constructor(data: any, parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Object, parent, fieldInParent, sendOpCallback);

    this._children = {};

    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(data[prop], this, prop, this.sendOpCallback);
      }
    }
  }

  get(key: string): RealTimeValue<any> {
    return this._children[key];
  }

  set(property: string, value: any): RealTimeValue<any> {

    var operation: DiscreteOperation;
    if (this._children.hasOwnProperty(property)) {
      operation = new ObjectSetPropertyOperation(this.path(), false, property, value);
      this._children[property]._setDetached();
    } else {
      operation = new ObjectAddPropertyOperation(this.path(), false, property, value);
    }

    var child: RealTimeValue<any> = RealTimeValueFactory.create(value, this, property, this.sendOpCallback);
    this._children[property] = child;
    this.sendOpCallback(operation);
    return child;
  }

  remove(property: string): void {
    if (!this._children.hasOwnProperty(property)) {
      throw new Error("Cannot remove property that is undefined!");
    }
    var operation: ObjectRemovePropertyOperation = new ObjectRemovePropertyOperation(this.path(), false, property);

    this._children[property]._setDetached();
    delete this._children[property];
    this.sendOpCallback(operation);
  }

  keys(): string[] {
    return Object.getOwnPropertyNames(this._children);
  }

  hasKey(property: string): boolean {
    return this._children.hasOwnProperty(property);
  }

  forEach(callback: (model: RealTimeValue<any>, property?: string) => void): void {
    for (var property in this._children) {
      if (this._children.hasOwnProperty(property)) {
        callback(this._children[property], property);
      }
    }
  }

  //
  // private / protected methods.
  //

  protected _getValue(): { [key: string]: any; } {
    var returnObject: Object = {};
    this.forEach((model: RealTimeValue<any>, property: string) => {
      returnObject[property] = model.value();
    });
    return returnObject;
  }

  protected _setValue(value?: { [key: string]: any; }): void {
    if (!value || typeof value !== "object") {
      throw new Error("Value must be an object and cannot be null or undefined!");
    }

    var operation: ObjectSetOperation = new ObjectSetOperation(this.path(), false, value);

    this.forEach((oldChild: RealTimeValue<any>) => oldChild._setDetached());
    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this.sendOpCallback);
      }
    }
    this.sendOpCallback(operation);
  }

  _path(pathArgs: Path): RealTimeValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var prop: string = <string> pathArgs[0];
    var child: RealTimeValue<any> = this._children[prop];
    if (pathArgs.length > 1) {
      if (child.type() === RealTimeValueType.Object) {
        return (<RealTimeObject> child).child(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === RealTimeValueType.Array) {
        return (<RealTimeArray> child).child(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return RealTimeValueFactory.create(undefined, null, null, this.sendOpCallback);
      }
    } else {
      return child;
    }
  }

  protected _detachChildren(): void {
    this.forEach((child: RealTimeValue<any>) => {
      child._setDetached();
    });
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: OperationType = operationEvent.operation.type;
      if (type === OperationType.OBJECT_ADD_PROPERTY) {
        this._handleAddPropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_SET_PROPERTY) {
        this._handleSetPropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_REMOVE_PROPERTY) {
        this._handleRemovePropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_SET) {
        this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      var childPath: any = relativePath[0];
      if (typeof childPath !== "string") {
        throw new Error("Invalid path element, object properties must be a string");
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

  private _handleAddPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
    var property: string = operation.prop;
    var value: Object|number|string|boolean = operation.value;

    var oldChild: RealTimeValue<any> = this._children[property];

    this._children[property] = RealTimeValueFactory.create(value, this, property, this.sendOpCallback);

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: property,
      value: value
    };

    this.emitEvent(event);

    if (oldChild) {
      oldChild._setDetached();
    }
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
    var property: string = operation.prop;
    var value: Object|number|string|boolean = operation.value;

    var oldChild: RealTimeValue<any> = this._children[property];

    this._children[property] = RealTimeValueFactory.create(value, this, property, this.sendOpCallback);

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: property,
      value: value
    };

    this.emitEvent(event);

    if (oldChild) {
      oldChild._setDetached();
    }
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
    var property: string = operation.prop;

    var oldChild: RealTimeValue<any> = this._children[property];

    if (oldChild) {
      delete this._children[property];

      var event: ObjectRemoveEvent = {
        src: this,
        name: RealTimeObject.Events.SET,
        sessionId: operationEvent.sessionId,
        userId: operationEvent.username,
        version: operationEvent.version,
        timestamp: operationEvent.timestamp,
        key: property
      };

      this.emitEvent(event);

      oldChild._setDetached();
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
    var value: Object = operation.value;

    var oldChildren: Object = this._children;

    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this.sendOpCallback);
      }
    }

    var event: ObjectSetValueEvent = {
      src: this,
      name: RealTimeObject.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };

    this.emitEvent(event);

    for (var property in oldChildren) {
      if (oldChildren.hasOwnProperty(property)) {
        oldChildren[property]._setDetached();
      }
    }
  }
}

export interface ObjectSetEvent extends ModelChangeEvent {
  src: RealTimeObject;
  key: string;
  value: any;
}

export interface ObjectRemoveEvent extends ModelChangeEvent {
  src: RealTimeObject;
  key: string;
}

export interface ObjectSetValueEvent extends ModelChangeEvent {
  src: RealTimeObject;
  value:  { [key: string]: any; };
}

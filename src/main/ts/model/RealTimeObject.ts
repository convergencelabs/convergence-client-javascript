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
              _sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Object, parent, fieldInParent, _sendOpCallback);

    this._children = {};

    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(data[prop], this, prop, this._sendOpCallback);
      }
    }
  }

  get(key: string): RealTimeValue<any> {
    return this._children[key];
  }

  set(key: string, value: any): RealTimeValue<any> {

    var operation: DiscreteOperation;
    if (this._children.hasOwnProperty(key)) {
      operation = new ObjectSetPropertyOperation(this.path(), false, key, value);
      this._children[key]._detach();
    } else {
      operation = new ObjectAddPropertyOperation(this.path(), false, key, value);
    }

    var child: RealTimeValue<any> = RealTimeValueFactory.create(value, this, key, this._sendOpCallback);
    this._children[key] = child;
    this._sendOperation(operation);
    return child;
  }

  remove(key: string): void {
    if (!this._children.hasOwnProperty(key)) {
      throw new Error("Cannot remove property that is undefined!");
    }
    var operation: ObjectRemovePropertyOperation = new ObjectRemovePropertyOperation(this.path(), false, key);

    this._children[key]._detach();
    delete this._children[key];
    this._sendOperation(operation);
  }

  keys(): string[] {
    return Object.getOwnPropertyNames(this._children);
  }

  hasKey(key: string): boolean {
    return this._children.hasOwnProperty(key);
  }

  forEach(callback: (model: RealTimeValue<any>, key?: string) => void): void {
    for (var key in this._children) {
      if (this._children.hasOwnProperty(key)) {
        callback(this._children[key], key);
      }
    }
  }

  //
  // private / protected methods.
  //

  protected _getValue(): { [key: string]: any; } {
    var returnObject: Object = {};
    this.forEach((model: RealTimeValue<any>, key: string) => {
      returnObject[key] = model.value();
    });
    return returnObject;
  }

  protected _setValue(value?: { [key: string]: any; }): void {
    if (!value || typeof value !== "object") {
      throw new Error("Value must be an object and cannot be null or undefined!");
    }

    this.forEach((oldChild: RealTimeValue<any>) => oldChild._detach());
    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this._sendOpCallback);
      }
    }

    var operation: ObjectSetOperation = new ObjectSetOperation(this.path(), false, value);
    this._sendOperation(operation);
  }

  _path(pathArgs: Path): RealTimeValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var prop: string = <string> pathArgs[0];
    var child: RealTimeValue<any> = this._children[prop];
    if (pathArgs.length > 1) {
      if (child.type() === RealTimeValueType.Object) {
        return (<RealTimeObject> child).dataAt(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === RealTimeValueType.Array) {
        return (<RealTimeArray> child).dataAt(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return RealTimeValueFactory.create(undefined, null, null, this._sendOperation);
      }
    } else {
      return child;
    }
  }

  protected _detachChildren(): void {
    this.forEach((child: RealTimeValue<any>) => {
      child._detach();
    });
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      var type: OperationType = operationEvent.operation.type;
      if (type === OperationType.OBJECT_ADD) {
        this._handleAddPropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_SET) {
        this._handleSetPropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_REMOVE) {
        this._handleRemovePropertyOperation(operationEvent);
      } else if (type === OperationType.OBJECT_VALUE) {
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
    var key: string = operation.prop;
    var value: Object|number|string|boolean = operation.value;

    var oldChild: RealTimeValue<any> = this._children[key];

    this._children[key] = RealTimeValueFactory.create(value, this, key, this._sendOperation);

    if (oldChild) {
      oldChild._detach();
    }

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: key,
      value: value
    };

    this.emitEvent(event);
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
    var key: string = operation.prop;
    var value: Object|number|string|boolean = operation.value;

    var oldChild: RealTimeValue<any> = this._children[key];

    this._children[key] = RealTimeValueFactory.create(value, this, key, this._sendOperation);

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: key,
      value: value
    };

    this.emitEvent(event);

    if (oldChild) {
      oldChild._detach();
    }
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
    var key: string = operation.prop;

    var oldChild: RealTimeValue<any> = this._children[key];

    if (oldChild) {
      delete this._children[key];

      var event: ObjectRemoveEvent = {
        src: this,
        name: RealTimeObject.Events.SET,
        sessionId: operationEvent.sessionId,
        userId: operationEvent.username,
        version: operationEvent.version,
        timestamp: operationEvent.timestamp,
        key: key
      };

      this.emitEvent(event);

      oldChild._detach();
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
    var value: Object = operation.value;

    var oldChildren: Object = this._children;

    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this._sendOperation);
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

    for (var key in oldChildren) {
      if (oldChildren.hasOwnProperty(key)) {
        oldChildren[key]._detach();
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

import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import DiscreteOperation from "./ot/ops/DiscreteOperation";
import {RealTimeValue} from "./RealTimeValue";
import ObjectSetPropertyOperation from "./ot/ops/ObjectSetPropertyOperation";
import ObjectAddPropertyOperation from "./ot/ops/ObjectAddPropertyOperation";
import ObjectRemovePropertyOperation from "./ot/ops/ObjectRemovePropertyOperation";
import ObjectSetOperation from "./ot/ops/ObjectSetOperation";
import {Path} from "./ot/Path";
import RealTimeArray from "./RealTimeArray";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import RealTimeValueFactory from "./RealTimeValueFactory";
import {ModelChangeEvent} from "./events";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {OperationType} from "./ot/ops/OperationType";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ChildChangedEvent} from "./RealTimeContainerValue";
import {ObjectValue} from "../connection/protocol/model/dataValue";
import {DataValue} from "../connection/protocol/model/dataValue";

export default class RealTimeObject extends RealTimeContainerValue<{ [key: string]: any; }> {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    CHILD_CHANGED: RealTimeContainerValue.Events.CHILD_CHANGED
  };

  private _children: { [key: string]: RealTimeValue<any>; };

  /**
   * Constructs a new RealTimeObject.
   */
  constructor(data: ObjectValue,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Object, data.id, parent, fieldInParent, callbacks, model);

    this._children = {};

    for (var prop in data.children) {
      if (data.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(data.children[prop], this, prop, this._callbacks, this.model());
      }
    }
  }

  get(key: string): RealTimeValue<any> {
    return this._children[key];
  }

  set(key: string, value: any): RealTimeValue<any> {
    var dataValue: DataValue = this._model._createDataValue(value);

    var operation: DiscreteOperation;
    if (this._children.hasOwnProperty(key)) {
      operation = new ObjectSetPropertyOperation(this.id(), false, key, dataValue);
      this._children[key]._detach();
    } else {
      operation = new ObjectAddPropertyOperation(this.id(), false, key, dataValue);
    }

    var child: RealTimeValue<any> = RealTimeValueFactory.create(dataValue, this, key, this._callbacks, this.model());
    this._children[key] = child;
    this._sendOperation(operation);
    return child;
  }

  remove(key: string): void {
    if (!this._children.hasOwnProperty(key)) {
      throw new Error("Cannot remove property that is undefined!");
    }
    var operation: ObjectRemovePropertyOperation = new ObjectRemovePropertyOperation(this.id(), false, key);

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
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this._callbacks, this.model());
      }
    }

    var operation: ObjectSetOperation = new ObjectSetOperation(this.id(), false, value);
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
        return RealTimeValueFactory.create(undefined, null, null, this._callbacks, this.model());
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

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteOperation(operationEvent: ModelOperationEvent): ModelChangeEvent {
    switch (operationEvent.operation.type) {
      case OperationType.OBJECT_ADD:
        return this._handleAddPropertyOperation(operationEvent);
      case OperationType.OBJECT_SET:
        return this._handleSetPropertyOperation(operationEvent);
      case OperationType.OBJECT_REMOVE:
        return this._handleRemovePropertyOperation(operationEvent);
      case OperationType.OBJECT_VALUE:
        return this._handleSetOperation(operationEvent);
      default:
        throw new Error("Invalid operation for RealTimeObject");
    }
  }

  bubbleChangeEvent(): void {
    //var child: RealTimeValue<any> = this._getChild(relativePath[0]);
    //
    //// fixme what if child doens't exist?
    //var subPath: Path = relativePath.slice(0);
    //subPath.shift();
    //var childEvent: ModelChangeEvent = child._handleRemoteOperation(subPath, operationEvent);
    //var event: ChildChangedEvent = {
    //  name: RealTimeObject.Events.CHILD_CHANGED,
    //  src: this,
    //  relativePath: relativePath,
    //  childEvent: childEvent
    //};
    //this.emitEvent(event);
    //return childEvent;
  }

  private _handleAddPropertyOperation(operationEvent: ModelOperationEvent): ObjectSetEvent {
    var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
    var key: string = operation.prop;
    var value: DataValue = operation.value;

    var oldChild: RealTimeValue<any> = this._children[key];

    this._children[key] = RealTimeValueFactory.create(value, this, key, this._callbacks, this.model());

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
    return event;
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): ObjectSetEvent {
    var operation: ObjectSetPropertyOperation = <ObjectSetPropertyOperation> operationEvent.operation;
    var key: string = operation.prop;
    var value: DataValue = operation.value;

    var oldChild: RealTimeValue<any> = this._children[key];

    this._children[key] = RealTimeValueFactory.create(value, this, key, this._callbacks, this.model());

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
    return event;
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): ObjectRemoveEvent {
    var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
    var key: string = operation.prop;

    var oldChild: RealTimeValue<any> = this._children[key];

    if (oldChild) {
      delete this._children[key];

      var event: ObjectRemoveEvent = {
        src: this,
        name: RealTimeObject.Events.REMOVE,
        sessionId: operationEvent.sessionId,
        userId: operationEvent.username,
        version: operationEvent.version,
        timestamp: operationEvent.timestamp,
        key: key
      };

      this.emitEvent(event);
      oldChild._detach();
      return event;
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): ObjectSetValueEvent {
    var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
    var value: {[key: string]: DataValue} = operation.value;

    var oldChildren: Object = this._children;

    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this._callbacks, this.model());
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
    return event;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    // fixme implement when we have object references.
    throw new Error("Objects to do have references yet.");
  }

  private _getChild(relPath: PathElement): RealTimeValue<any> {
    if (typeof relPath !== "string") {
      throw new Error("Invalid path element, object properties must be a string");
    }
    var child: RealTimeValue<any> = this._children[relPath];
    if (child === undefined) {
      throw new Error("Invalid path element, child does not exist");
    }
    return child;
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

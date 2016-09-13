import {Model} from "./Model";
import {ModelValueType} from "../ModelValueType";
import {ModelNode} from "./ModelNode";
import {ObjectValue} from "../dataValue";
import {Validation} from "../../util/Validation";
import {DataValue} from "../dataValue";
import {ObjectSetPropertyOperation} from "../ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from "../ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../ot/ops/ObjectSetOperation";
import {Path} from "../ot/Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {ModelNodeFactory} from "./ModelNodeFactory";
import {ObjectNodeSetEvent} from "./events";
import {ObjectNodeRemoveEvent} from "./events";
import {ObjectNodeSetValueEvent} from "./events";
import {ContainerNode} from "./ContainerNode";
import {DataValueFactory} from "../DataValueFactory";

export class ObjectNode extends ContainerNode<{ [key: string]: any; }> {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    NODE_CHANGED: ModelNode.Events.NODE_CHANGED,
    OPERATION: ModelNode.Events.OPERATION
  };

  private _children: Map<string, ModelNode<any>>;

  /**
   * Constructs a new RealTimeObject.
   */
  constructor(data: ObjectValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string,
              private dataValueFactory: DataValueFactory) {
    super(ModelValueType.Object, data.id, path, model, sessionId, username);

    this._children = new Map<string, ModelNode<any>>();

    Object.getOwnPropertyNames(data.children).forEach((prop: string) => {
      let child: DataValue = data.children[prop];
      this._idToPathElement.set(child.id, prop);
      this._children.set(prop, ModelNodeFactory.create(child, this._pathCB(child.id), model,
        this.sessionId, this.username, this.dataValueFactory));
    });

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  dataValue(): ObjectValue {
    let values: {[key: string]: DataValue} = {};
    this._children.forEach((value, key) => {
      values[key] = value.dataValue();
    });

    return <ObjectValue> {
      id: this.id(),
      type: "object",
      children: values
    };
  }

  get(key: string): ModelNode<any> {
    Validation.isString(key, "key");
    return this._children.get(key);
  }

  set(key: string, value: any): ModelNode<any> {
    var dataValue: DataValue = this.dataValueFactory.createDataValue(value);
    this._applySet(key, dataValue, true, this.sessionId, this.username);
    return this.get(key);
  }

  remove(key: string): void {
    this._applyRemove(key, true, this.sessionId, this.username);
  }

  keys(): string[] {
    let keys: string[] = [];
    this._children.forEach((v, k) => {
      keys.push(k);
    });
    return keys;
  }

  hasKey(key: string): boolean {
    return this._children.has(key);
  }

  forEach(callback: (model: ModelNode<any>, key?: string) => void): void {
    this._children.forEach((value, key) => {
      callback(value, key);
    });
  }

  //
  // private / protected methods.
  //

  protected _getData(): Map<string, any> {
    var returnObject: Map<string, any> = new Map<string, ModelNode<any>>();
    this.forEach((model: ModelNode<any>, key: string) => {
      returnObject[key] = model.data();
    });
    return returnObject;
  }

  protected _setData(data?: {[key: string]: any}): void {
    let values: {[key: string]: DataValue} = {};

    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        let dataValue: DataValue = this.dataValueFactory.createDataValue(data[prop]);
        values[prop] = dataValue;
      }
    }

    this._applySetValue(values, true, this.sessionId, this.username);
  }

  _valueAt(pathArgs: Path): ModelNode<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var prop: string = <string> pathArgs[0];
    var child: ModelNode<any> = this._children.get(prop);
    if (typeof child === "undefined") {
      return;
    }

    if (pathArgs.length > 1) {
      if (child.type() === ModelValueType.Object || child.type() === ModelValueType.Array) {
        return (<ContainerNode<any>> child).valueAt(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return ModelNodeFactory.create(undefined, () => {
          return null;
        }, this.model(), this.sessionId, this.username, this.dataValueFactory);
      }
    } else {
      return child;
    }
  }

  protected _detachChildren(): void {
    this.forEach((child: ModelNode<any>) => {
      child._detach();
    });
  }

  private _pathCB(id: string): (() => Path) {
    let self: ObjectNode = this;
    return () => {
      let path: Path = self.path();
      path.push(self._idToPathElement.get(id));
      return path;
    };
  };

  private _applySet(key: string, value: DataValue, local: boolean, sessionId: string, username: string): void {
    Validation.isString(key, "key");

    if (this._children.has(key)) {
      this._children.get(key).removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      this._children.get(key)._detach();
    }

    var child: ModelNode<any> = ModelNodeFactory.create(value, this._pathCB(value.id), this._model,
      this.sessionId, this.username, this.dataValueFactory);
    child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.set(key, child);
    this._idToPathElement.set(child.id(), key);

    var event: ObjectNodeSetEvent = new ObjectNodeSetEvent(this, local, key, child, this.sessionId, this.username);
    this._emitValueEvent(event);
  }

  private _applyRemove(key: string, local: boolean, sessionId: string, username: string): void {
    Validation.isString(key, "key");

    if (!this._children.has(key)) {
      this._idToPathElement.delete(key);
      this._children.get(key).removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      this._children.get(key)._detach();
      this._children.delete(key);

      var event: ObjectNodeRemoveEvent = new ObjectNodeRemoveEvent(this, local, key, this.sessionId, this.username);
    }

    this._emitValueEvent(event);
  }

  private _applySetValue(values: {[key: string]: DataValue}, local: boolean, sessionId: string, username: string): void {
    let oldChildren: Map<string, ModelNode<any>> = this._children;

    this._children = new Map<string, ModelNode<any>>();

    for (var prop in values) {
      if (values.hasOwnProperty(prop)) {
        let dataValue: DataValue = values[prop];
        this._idToPathElement.set(dataValue.id, prop);
        this._children.set(prop,
          ModelNodeFactory.create(dataValue, this._pathCB(dataValue.id), this.model(),
            this.sessionId, this.username, this.dataValueFactory));
      }
    }

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });

    var event: ObjectNodeSetValueEvent = new ObjectNodeSetValueEvent(this, local, this.data(), this.sessionId, this.username);

    this._emitValueEvent(event);

    oldChildren.forEach((child: ModelNode<any>) => {
      child._detach();
      child.removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    switch (operationEvent.operation.type) {
      case OperationType.OBJECT_ADD:
        this._handleAddPropertyOperation(operationEvent);
        break;
      case OperationType.OBJECT_SET:
        this._handleSetPropertyOperation(operationEvent);
        break;
      case OperationType.OBJECT_REMOVE:
        this._handleRemovePropertyOperation(operationEvent);
        break;
      case OperationType.OBJECT_VALUE:
        this._handleSetOperation(operationEvent);
        break;
      default:
        throw new Error("Invalid operation for RealTimeObject");
    }
  }

  private _handleAddPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectAddPropertyOperation = <ObjectAddPropertyOperation> operationEvent.operation;
    this._applySet(operation.prop, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectSetPropertyOperation = <ObjectSetPropertyOperation> operationEvent.operation;
    this._applySet(operation.prop, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
    this._applyRemove(operation.prop, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }
}

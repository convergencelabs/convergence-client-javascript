import {ModelNode} from "./ModelNode";
import {ArrayValue} from "../dataValue";
import {ContainerNode} from "./ContainerNode";
import {Model} from "./Model";
import {ModelValueType} from "../ModelValueType";
import {DataValue} from "../dataValue";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {Path} from "../ot/Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {ModelNodeFactory} from "./ModelNodeFactory";
import {ArrayNodeInsertEvent} from "./events";
import {ArrayNodeReorderEvent} from "./events";
import {ArrayNodeRemoveEvent} from "./events";
import {ArrayNodeSetEvent} from "./events";
import {ArrayNodeSetValueEvent} from "./events";
import {DataValueFactory} from "../DataValueFactory";

export class ArrayNode extends ContainerNode<any[]> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    NODE_CHANGED: ContainerNode.Events.NODE_CHANGED
  };

  private _children: ModelNode<any>[];

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(data: ArrayValue,
              path: () => Path,
              model: Model,
              sessionId: string,
              username: string,
              private dataValueFactory: DataValueFactory) {
    super(ModelValueType.Array, data.id, path, model, sessionId, username);

    this._children = [];

    for (var i: number = 0; i < data.children.length; i++) {
      let child: DataValue = data.children[i];
      this._idToPathElement.set(child.id, i);
      this._children.push(ModelNodeFactory.create(child, this._pathCB(child.id), model, sessionId, username, dataValueFactory));
    }

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  dataValue(): ArrayValue {
    let values: DataValue[] = this._children.map((node: ModelNode<any>) => {
      return node.dataValue();
    });
    return <ArrayValue> {
      id: this.id(),
      type: "array",
      children: values
    };
  }

  get(index: number): ModelNode<any> {
    return this._children[index];
  }

  set(index: number, value: any): ModelNode<any> {
    var dataValue: DataValue = this.dataValueFactory.createDataValue(value);
    this._applySet(index, dataValue, true, this.sessionId, this.username);
    return this.get(index);

  }

  insert(index: number, value: any): ModelNode<any> {
    var dataValue: DataValue = this.dataValueFactory.createDataValue(value);
    this._applyInsert(index, dataValue, true, this.sessionId, this.username);
    return this.get(index);
  }

  remove(index: number): Object|number|string|boolean {
    let oldValue: Object|number|string|boolean = this.get(index).data();
    this._applyRemove(index, true, this.sessionId, this.username);
    return oldValue;
  }

  reorder(fromIndex: number, toIndex: number): void {
    this._applyReorder(fromIndex, toIndex, true, this.sessionId, this.username);
  }

  push(value: any): ModelNode<any> {
    return this.insert(this._children.length, value);
  }

  pop(): any {
    return this.remove(this._children.length - 1);
  }

  unshift(value: any): ModelNode<any> {
    return this.insert(0, value);
  }

  shift(): any {
    return this.remove(0);
  }

  length(): number {
    return this._children.length;
  }

  forEach(callback: (value: ModelNode<any>, index?: number) => void): void {
    this._children.forEach(callback);
  }

  //
  // protected and private methods.
  //

  protected _getData(): Array<any> {
    var returnVal: Array<any> = [];
    this.forEach((child: ModelNode<any>) => {
      returnVal.push(child.data());
    });
    return returnVal;
  }

  protected _setData(data: any[]): void {
    var dataValues: DataValue[] = data.map((value: any) => {
      return this.dataValueFactory.createDataValue(value);
    });

    this._applySetValue(dataValues, true, this.sessionId, this.username);
  }

  protected _detachChildren(): void {
    this._idToPathElement.clear();
    this.forEach((child: ModelNode<any>) => {
      child._detach();
      child.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  _valueAt(pathArgs: Path): ModelNode<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var index: number = <number> pathArgs[0];
    var child: ModelNode<any> = this._children[index];
    if (pathArgs.length > 1) {
      if (child.type() === ModelValueType.Object || child.type() === ModelValueType.Array) {
        return (<ContainerNode<any>> child).valueAt(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return ModelNodeFactory.create(undefined, null, null, this.sessionId, this.username, this.dataValueFactory);
      }
    } else {
      return child;
    }
  }

  // Handlers for incoming operations

  private _applyInsert(index: number, value: DataValue, local: boolean, sessionId: string, username: string): void {
    this._validateInsert(index, value);

    this._idToPathElement.set(value.id, index);
    var child: ModelNode<any> = ModelNodeFactory.create(
      value,
      this._pathCB(value.id),
      this._model,
      this.sessionId,
      this.username,
      this.dataValueFactory);
    child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.splice(index, 0, child);
    this._updateIdToPathElementMap(index);

    var event: ArrayNodeInsertEvent = new ArrayNodeInsertEvent(this, local, index, child, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySet(index: number, value: DataValue, local: boolean, sessionId: string, username: string): void {
    this._validateReplace(index, value);

    var oldChild: ModelNode<any> = this._children[index];
    oldChild.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);

    this._idToPathElement.set(value.id, index);
    var newChild: ModelNode<any> = ModelNodeFactory.create(value,
      this._pathCB(value.id), this.model(), this.sessionId, this.username, this.dataValueFactory);
    newChild.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children[index] = newChild;
    this._updateIdToPathElementMap(index);
    oldChild._detach();

    var event: ArrayNodeSetEvent = new ArrayNodeSetEvent(this, local, index, newChild.data(), sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, local: boolean, sessionId: string, username: string): void {
    this._validateRemove(index);

    var child: ModelNode<any> = this._children[index];
    child.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.splice(index, 1);
    this._updateIdToPathElementMap(index);
    child._detach();

    var event: ArrayNodeRemoveEvent = new ArrayNodeRemoveEvent(this, local, index, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySetValue(data: DataValue[], local: boolean, sessionId: string, username: string): void {
    this._validateSet(data);

    this._detachChildren();
    this._children = data.map((value: any, i: number) => {
      this._idToPathElement.set(value.id, i);
      return ModelNodeFactory.create(value, this._pathCB(value.id), this.model(), this.sessionId,
        this.username, this.dataValueFactory);
    });

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });

    var event: ArrayNodeSetValueEvent = new ArrayNodeSetValueEvent(this, local, this.data(), sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyReorder(fromIndex: number, toIndex: number, local: boolean, sessionId: string, username: string): void {
    this._validateMove(fromIndex, toIndex);

    var child: ModelNode<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this._updateIdToPathElementMap(Math.min(fromIndex, toIndex));

    var event: ArrayNodeReorderEvent = new ArrayNodeReorderEvent(this, local, fromIndex, toIndex, sessionId, username);
    this._emitValueEvent(event);
  }

  _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
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
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayInsertOperation = <ArrayInsertOperation> operationEvent.operation;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
    this._applyReorder(operation.fromIndex, operation.toIndex, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
    this._applyRemove(operation.index, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
    this._applySet(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _pathCB(id: string): (() => Path) {
    let self: ArrayNode = this;
    return () => {
      let path: Path = self.path();
      path.push(self._idToPathElement.get(id));
      return path;
    };
  };

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
   * Update id to index mapping for all children.
   * @param {number} start
   */
  private _updateIdToPathElementMap(start: number): void {
    for (var i: number = start; i < this._children.length; i++) {
      var child: ModelNode<any> = this._children[i];
      this._idToPathElement.set(child.id(), i);
    }
  }
}

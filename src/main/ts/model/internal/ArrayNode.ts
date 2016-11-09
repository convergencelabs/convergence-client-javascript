import {ModelNode} from "./ModelNode";
import {ArrayValue} from "../dataValue";
import {ContainerNode} from "./ContainerNode";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {DataValue} from "../dataValue";
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
import {ArrayInsert} from "../ot/ops/operationChanges";
import {ArrayMove} from "../ot/ops/operationChanges";
import {ArrayRemove} from "../ot/ops/operationChanges";
import {ArrayReplace} from "../ot/ops/operationChanges";
import {ArraySet} from "../ot/ops/operationChanges";

export class ArrayNode extends ContainerNode<any[]> {

  public static Events: any = {
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
    super(ModelElementType.Array, data.id, path, model, sessionId, username);

    this._children = [];

    for (let i: number = 0; i < data.children.length; i++) {
      let child: DataValue = data.children[i];
      this._idToPathElement.set(child.id, i);
      this._children.push(ModelNodeFactory.create(child,
        this._pathCB(child.id), model, sessionId, username, dataValueFactory));
    }

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  public dataValue(): ArrayValue {
    let values: DataValue[] = this._children.map((node: ModelNode<any>) => {
      return node.dataValue();
    });
    return <ArrayValue> {
      id: this.id(),
      type: "array",
      children: values
    };
  }

  public get(index: number): ModelNode<any> {
    return this._children[index];
  }

  public set(index: number, value: any): ModelNode<any> {
    const dataValue: DataValue = this.dataValueFactory.createDataValue(value);
    this._applySet(index, dataValue, true, this.sessionId, this.username);
    return this.get(index);

  }

  public insert(index: number, value: any): ModelNode<any> {
    const dataValue: DataValue = this.dataValueFactory.createDataValue(value);
    this._applyInsert(index, dataValue, true, this.sessionId, this.username);
    return this.get(index);
  }

  public remove(index: number): Object|number|string|boolean {
    const oldValue: Object|number|string|boolean = this.get(index).data();
    this._applyRemove(index, true, this.sessionId, this.username);
    return oldValue;
  }

  public reorder(fromIndex: number, toIndex: number): void {
    this._applyReorder(fromIndex, toIndex, true, this.sessionId, this.username);
  }

  public push(value: any): ModelNode<any> {
    return this.insert(this._children.length, value);
  }

  public pop(): any {
    return this.remove(this._children.length - 1);
  }

  public unshift(value: any): ModelNode<any> {
    return this.insert(0, value);
  }

  public shift(): any {
    return this.remove(0);
  }

  public length(): number {
    return this._children.length;
  }

  public forEach(callback: (value: ModelNode<any>, index?: number) => void): void {
    this._children.forEach(callback);
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
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
  //
  // protected and private methods.
  //

  protected _getData(): Array<any> {
    const returnVal: Array<any> = [];
    this.forEach((child: ModelNode<any>) => {
      returnVal.push(child.data());
    });
    return returnVal;
  }

  protected _setData(data: any[]): void {
    const dataValues: DataValue[] = data.map((value: any) => {
      return this.dataValueFactory.createDataValue(value);
    });

    this._applySetValue(dataValues, true, this.sessionId, this.username);
  }

  protected _detachChildren(local: boolean): void {
    this._idToPathElement.clear();
    this.forEach((child: ModelNode<any>) => {
      child._detach(local);
      child.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  protected _valueAt(pathArgs: Path): ModelNode<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    const index: number = <number> pathArgs[0];
    const child: ModelNode<any> = this._children[index];
    if (pathArgs.length > 1) {
      if (child.type() === ModelElementType.Object || child.type() === ModelElementType.Array) {
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
    const child: ModelNode<any> = ModelNodeFactory.create(
      value,
      this._pathCB(value.id),
      this._model,
      this.sessionId,
      this.username,
      this.dataValueFactory);
    child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.splice(index, 0, child);
    this._updateIdToPathElementMap(index);

    const event: ArrayNodeInsertEvent = new ArrayNodeInsertEvent(this, local, index, child, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySet(index: number, value: DataValue, local: boolean, sessionId: string, username: string): void {
    this._validateReplace(index, value);

    const oldChild: ModelNode<any> = this._children[index];
    oldChild.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);

    this._idToPathElement.set(value.id, index);
    const newChild: ModelNode<any> = ModelNodeFactory.create(value,
      this._pathCB(value.id), this.model(), this.sessionId, this.username, this.dataValueFactory);
    newChild.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children[index] = newChild;
    this._updateIdToPathElementMap(index);
    oldChild._detach(local);

    const event: ArrayNodeSetEvent = new ArrayNodeSetEvent(this, local, index, newChild.data(), sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, local: boolean, sessionId: string, username: string): void {
    this._validateRemove(index);

    const child: ModelNode<any> = this._children[index];
    child.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.splice(index, 1);
    this._updateIdToPathElementMap(index);
    child._detach(local);

    const event: ArrayNodeRemoveEvent = new ArrayNodeRemoveEvent(this, local, index, sessionId, username);
    this._emitValueEvent(event);
  }

  private _applySetValue(data: DataValue[], local: boolean, sessionId: string, username: string): void {
    this._validateSet(data);

    this._detachChildren(local);
    this._children = data.map((value: any, i: number) => {
      this._idToPathElement.set(value.id, i);
      return ModelNodeFactory.create(value, this._pathCB(value.id), this.model(), this.sessionId,
        this.username, this.dataValueFactory);
    });

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });

    const event: ArrayNodeSetValueEvent = new ArrayNodeSetValueEvent(this, local, this.data(), sessionId, username);
    this._emitValueEvent(event);
  }

  private _applyReorder(fromIndex: number, toIndex: number, local: boolean, sessionId: string, username: string): void {
    this._validateMove(fromIndex, toIndex);

    const child: ModelNode<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this._updateIdToPathElementMap(Math.min(fromIndex, toIndex));

    const event: ArrayNodeReorderEvent =
      new ArrayNodeReorderEvent(this, local, fromIndex, toIndex, sessionId, username);
    this._emitValueEvent(event);
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayInsert = <ArrayInsert> operationEvent.operation;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayMove = <ArrayMove> operationEvent.operation;
    this._applyReorder(operation.fromIndex, operation.toIndex, false,
      operationEvent.sessionId, operationEvent.username);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayRemove = <ArrayRemove> operationEvent.operation;
    this._applyRemove(operation.index, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayReplace = <ArrayReplace> operationEvent.operation;
    this._applySet(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.username);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArraySet = <ArraySet> operationEvent.operation;
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

    if (typeof value === "undefined" || typeof value === "function") {
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

    if (typeof value === "undefined" || typeof value === "function") {
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
    for (let i: number = start; i < this._children.length; i++) {
      let child: ModelNode<any> = this._children[i];
      this._idToPathElement.set(child.id(), i);
    }
  }
}

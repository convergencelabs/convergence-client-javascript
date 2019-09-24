import {ModelNode} from "./ModelNode";
import {DataValue, ArrayValue, DataValueType} from "../dataValue";
import {ContainerNode} from "./ContainerNode";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {Path} from "../Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {ModelNodeFactory} from "./ModelNodeFactory";
import {DataValueFactory} from "../DataValueFactory";
import {
  ArrayNodeInsertEvent,
  ArrayNodeReorderEvent,
  ArrayNodeRemoveEvent,
  ArrayNodeSetEvent,
  ArrayNodeSetValueEvent
} from "./events";
import {
  ArrayInsert,
  ArrayMove,
  ArrayRemove,
  ArrayReplace,
  ArraySet
} from "../ot/ops/operationChanges";
import {DomainUser} from "../../identity";
import {ConvergenceSession} from "../../ConvergenceSession";
import {Validation} from "../../util/Validation";

/**
 * @hidden
 * @internal
 */
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

  private _children: Array<ModelNode<any>>;
  private readonly _dataValueFactory: DataValueFactory;

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(data: ArrayValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession,
              dataValueFactory: DataValueFactory) {
    super(ModelElementType.ARRAY, data.id, path, model, session);

    this._children = [];
    this._dataValueFactory = dataValueFactory;

    for (let i: number = 0; i < data.children.length; i++) {
      const child: DataValue = data.children[i];
      this._idToPathElement.set(child.id, i);
      this._children.push(ModelNodeFactory.create(child,
        this._pathCB(child.id), model, session, dataValueFactory));
    }

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  public dataValue(): ArrayValue {
    const values: DataValue[] = this._children.map((node: ModelNode<any>) => {
      return node.dataValue();
    });

    return {
      id: this.id(),
      type: DataValueType.ARRAY,
      children: values
    } as ArrayValue;
  }

  public toJson(): any {
    const jsonArray: any[] = [];
    this.forEach(node => {
      jsonArray.push(node.toJson());
    });
    return jsonArray;
  }

  public get(index: number): ModelNode<any> {
    this._validateIndex(index, false);
    return this._children[index];
  }

  public set(index: number, value: any): ModelNode<any> {
    this._validateIndex(index, false);
    const dataValue: DataValue = this._dataValueFactory.createDataValue(value);
    this._applySet(index, dataValue, true, this._session.sessionId(), this._session.user());
    return this.get(index);
  }

  public insert(index: number, value: any): ModelNode<any> {
    this._validateIndex(index, true);
    const dataValue: DataValue = this._dataValueFactory.createDataValue(value);
    this._applyInsert(index, dataValue, true, this._session.sessionId(), this._session.user());
    return this.get(index);
  }

  public remove(index: number): ModelNode<any> {
    this._validateIndex(index, false);
    const oldValue: ModelNode<any> = this.get(index);
    this._applyRemove(index, true, this._session.sessionId(), this._session.user());
    return oldValue;
  }

  public reorder(fromIndex: number, toIndex: number): void {
    this._validateIndex(fromIndex, false, "fromIndex");
    this._validateIndex(toIndex, false, "toIndex");
    this._applyReorder(fromIndex, toIndex, true, this._session.sessionId(), this._session.user());
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

  public some(callback: (element: ModelNode<any>, index?: number) => boolean): boolean {
    return this._children.some(callback);
  }

  public every(callback: (element: ModelNode<any>, index?: number) => boolean): boolean {
    return this._children.every(callback);
  }

  public find(callback: (element: ModelNode<any>, index?: number) => boolean): ModelNode<any> {
    return this._children.find(callback);
  }

  public findIndex(callback: (element: ModelNode<any>, index?: number) => boolean): number {
    return this._children.findIndex(callback);
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

  protected _getData(): any[] {
    const returnVal: any[] = [];
    this.forEach((child: ModelNode<any>) => {
      returnVal.push(child.data());
    });
    return returnVal;
  }

  protected _setData(data: any[]): void {
    const dataValues: DataValue[] = data.map((value: any) => {
      return this._dataValueFactory.createDataValue(value);
    });

    this._applySetValue(dataValues, true, this._session.sessionId(), this._session.user());
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

    const index: number = pathArgs[0] as number;
    const child: ModelNode<any> = this._children[index];

    if (child === undefined) {
      return this._createUndefinedNode();
    }

    if (pathArgs.length > 1) {
      if (child.type() === ModelElementType.OBJECT || child.type() === ModelElementType.ARRAY) {
        return (child as ContainerNode<any>).valueAt(pathArgs.slice(1, pathArgs.length));
      } else {
        return this._createUndefinedNode();
      }
    } else {
      return child;
    }
  }

  private _validateIndex(index: number, includeEnd: boolean, name?: string): void {
    if (index < 0) {
      const iName = name ? name : "index";
      throw new Error(`${iName} must be >= 0: ${index}`);
    }

    if ((!includeEnd && index >= this._children.length) || (includeEnd && index > this._children.length)) {
      const iName = name ? name : "index";
      const comparison = includeEnd ? "<=" : "<";
      throw new Error(`${iName} must be ${comparison} the length of the array: ${index}`);
    }
  }

  // Handlers for incoming operations

  private _applyInsert(index: number, value: DataValue, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateInsert(index, value);

    this._idToPathElement.set(value.id, index);
    const child: ModelNode<any> = ModelNodeFactory.create(
      value,
      this._pathCB(value.id),
      this._model,
      this._session,
      this._dataValueFactory);
    child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.splice(index, 0, child);
    this._updateIdToPathElementMap(index);

    const event: ArrayNodeInsertEvent = new ArrayNodeInsertEvent(this, local, index, child, sessionId, user);
    this._emitValueEvent(event);
  }

  private _applySet(index: number, value: DataValue, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateReplace(index, value);

    const oldChild: ModelNode<any> = this._valueAt([index]);
    if (oldChild.type() !== ModelElementType.UNDEFINED) {
      oldChild.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      oldChild._detach(local);
    }

    this._idToPathElement.set(value.id, index);
    const newChild: ModelNode<any> = ModelNodeFactory.create(value,
      this._pathCB(value.id), this.model(), this._session, this._dataValueFactory);
    newChild.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children[index] = newChild;
    this._updateIdToPathElementMap(index);

    const event: ArrayNodeSetEvent =
      new ArrayNodeSetEvent(this, local, index, newChild, oldChild, sessionId, user);

    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateRemove(index);

    const oldChild: ModelNode<any> = this._valueAt([index]);
    if (oldChild.type() !== ModelElementType.UNDEFINED) {
      oldChild.removeListener(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      oldChild._detach(local);
    }

    this._children.splice(index, 1);
    this._updateIdToPathElementMap(index);

    const event: ArrayNodeRemoveEvent = new ArrayNodeRemoveEvent(this, local, index, oldChild, sessionId, user);
    this._emitValueEvent(event);
  }

  private _applySetValue(data: DataValue[], local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertArray(data, "data");

    this._detachChildren(local);

    this._children = data.map((value: any, i: number) => {
      this._idToPathElement.set(value.id, i);
      return ModelNodeFactory.create(
        value, this._pathCB(value.id), this.model(), this._session, this._dataValueFactory);
    });

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ArrayNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });

    const event: ArrayNodeSetValueEvent = new ArrayNodeSetValueEvent(this, local, this.data(), sessionId, user);
    this._emitValueEvent(event);
  }

  private _applyReorder(fromIndex: number, toIndex: number, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateMove(fromIndex, toIndex);

    const child: ModelNode<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this._updateIdToPathElementMap(Math.min(fromIndex, toIndex));

    const event: ArrayNodeReorderEvent =
      new ArrayNodeReorderEvent(this, local, fromIndex, toIndex, sessionId, user);
    this._emitValueEvent(event);
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayInsert = operationEvent.operation as ArrayInsert;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayMove = operationEvent.operation as ArrayMove;
    this._applyReorder(operation.fromIndex, operation.toIndex, false,
      operationEvent.sessionId, operationEvent.user);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayRemove = operationEvent.operation as ArrayRemove;
    this._applyRemove(operation.index, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArrayReplace = operationEvent.operation as ArrayReplace;
    this._applySet(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): void {
    const operation: ArraySet = operationEvent.operation as ArraySet;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _pathCB(id: string): (() => Path) {
    return () => {
      const path: Path = this.path();
      path.push(this._idToPathElement.get(id));
      return path;
    };
  }

  // Private Validation Methods

  private _validateInsert(index: number, value: object | number | string | boolean): void {
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

  private _validateReplace(index: number, value: object | number | string | boolean): void {
    // TODO: Add integer check
    if (this._children.length <= index || index < 0) {
      throw new Error("Index out of bounds!");
    }

    if (typeof value === "undefined" || typeof value === "function") {
      throw new Error("Illegal argument!");
    }
  }

  // Private Functions
  // FIXME this function actually does more that it needs to when we are doing a move.
  // we should take an optional end parameter.
  /**
   * Update id to index mapping for all children.
   * @param {number} start
   */
  private _updateIdToPathElementMap(start: number): void {
    for (let i: number = start; i < this._children.length; i++) {
      const child: ModelNode<any> = this._children[i];
      this._idToPathElement.set(child.id(), i);
    }
  }
}

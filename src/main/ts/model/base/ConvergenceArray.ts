import {PathElement} from ".././ot/Path";
import {ArrayInsertOperation} from ".././ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from ".././ot/ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from ".././ot/ops/ArrayReplaceOperation";
import {ArrayMoveOperation} from ".././ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from ".././ot/ops/ArraySetOperation";
import {Path} from ".././ot/Path";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {OperationType} from ".././ot/ops/OperationType";
import {ArrayValue} from ".././dataValue";
import {DataValue} from ".././dataValue";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceObject} from "./ConvergneceObject";
import {ConvergenceValue, ModelValueEvent} from "./ConvergenceValue";
import {ConvergenceModel} from "./ConvergenceModel";
import {ValueFactory} from "./ValueFactory";
import {ConvergenceValueType} from "./ConvergenceValueType";


export class ConvergenceArray extends ConvergenceContainerValue<any[]> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: ConvergenceValue.Events.DETACHED,
    MODEL_CHANGED: ConvergenceValue.Events.MODEL_CHANGED
  };

  private _children: Array<ConvergenceValue<any>>;

  /**
   * Constructs a new ConvergenceArray.
   */
  constructor(data: ArrayValue,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              valueFactory: ValueFactory,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Array, data.id, parent, fieldInParent, valueFactory, model);

    this._children = [];

    for (var i: number = 0; i < data.children.length; i++) {
      this._children.push(this._valueFactory.create(data.children[i], this, i));
    }
  }

  get(index: number): ConvergenceValue<any> {
    return this._children[index];
  }

  length(): number {
    return this._children.length;
  }

  forEach(callback: (value: ConvergenceValue<any>, index?: number) => void): void {
    this._children.forEach(callback);
  }

  //
  // protected and private methods.
  //

  protected _getValue(): Array<any> {
    var returnVal: Array<any> = [];
    this.forEach((child: ConvergenceValue<any>) => {
      returnVal.push(child.value());
    });
    return returnVal;
  }


  protected _detachChildren(): void {
    this.forEach((child: ConvergenceValue<any>) => {
      child._detach();
    });
  }

  _path(pathArgs: Path): ConvergenceValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var index: number = <number> pathArgs[0];
    var child: ConvergenceValue<any> = this._children[index];
    if (pathArgs.length > 1) {
      if (child.type() === ConvergenceValueType.Object) {
        return (<ConvergenceObject> child).dataAt(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === ConvergenceValueType.Array) {
        return (<ConvergenceArray> child).dataAt(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return this._valueFactory.create(undefined, null, null);
      }
    } else {
      return child;
    }
  }

  // Handlers for incoming operations

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
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
    var index: number = operation.index;
    var value: DataValue = operation.value;

    this._validateInsert(index, value);

    var newValue: ConvergenceValue<any> =
      this._valueFactory.create(value, this, index);

    this._children.splice(index, 0, newValue);
    this.updateFieldInParent(index);

    var event: ArrayInsertEvent = {
      src: this,
      name: ConvergenceArray.Events.INSERT,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: newValue
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
    var fromIndex: number = operation.fromIndex;
    var toIndex: number = operation.toIndex;

    this._validateMove(fromIndex, toIndex);

    var child: ConvergenceValue<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));

    var event: ArrayReorderEvent = {
      src: this,
      name: ConvergenceArray.Events.REORDER,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      fromIndex: fromIndex,
      toIndex: toIndex
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
    var index: number = operation.index;

    this._validateRemove(index);

    var child: ConvergenceValue<any> = this._children[index];
    this._children.splice(index, 1);
    this.updateFieldInParent(index);

    child._detach();

    var event: ArrayRemoveEvent = {
      src: this,
      name: ConvergenceArray.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: DataValue = operation.value;

    this._validateReplace(index, value);

    var child: ConvergenceValue<any> = this._children[index];
    var newValue: ConvergenceValue<any> = this._valueFactory.create(value, this, index);
    this._children[index] = newValue;
    this.updateFieldInParent(index);

    child._detach();

    var event: ArraySetEvent = {
      src: this,
      name: ConvergenceArray.Events.SET,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: newValue
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): ArraySetValueEvent {
    var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
    var values: DataValue[] = operation.value;

    this._validateSet(values);

    var oldChildren: Array<ConvergenceValue<any>> = this._children;
    this._children = values.map((value: DataValue, index: number) => {
      return this._valueFactory.create(value, this, index);
    });

    oldChildren.forEach((oldChild: ConvergenceValue<any>) => oldChild._detach());

    var event: ArraySetValueEvent = {
      src: this,
      name: ConvergenceArray.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: values
    };
    this.emitEvent(event);
    return event;
  }

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
   * Update fieldInParent for all children.
   * @param {number} start
   */
  private updateFieldInParent(start: number): void {
    for (var i: number = start; i < this._children.length; i++) {
      var child: ConvergenceValue<any> = this._children[i];
      child.fieldInParent = i;
    }
  }
}

export interface ArrayInsertEvent extends ModelValueEvent {
  index: number;
  value: any;
}

export interface ArrayRemoveEvent extends ModelValueEvent {
  index: number;
}

export interface ArraySetEvent extends ModelValueEvent {
  index: number;
  value: any;
}

export interface ArrayReorderEvent extends ModelValueEvent {
  fromIndex: number;
  toIndex: any;
}

export interface ArraySetValueEvent extends ModelValueEvent {
  value: Array<any>;
}

import {PathElement} from ".././ot/Path";
import {ObjectSetPropertyOperation} from ".././ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from ".././ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from ".././ot/ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from ".././ot/ops/ObjectSetOperation";
import {Path} from ".././ot/Path";
import {ModelOperationEvent} from ".././ModelOperationEvent";
import {OperationType} from ".././ot/ops/OperationType";
import {ObjectValue} from ".././dataValue";
import {DataValue} from ".././dataValue";
import {ConvergenceContainerValue} from "./ConvergenceContainerValue";
import {ConvergenceValue, ModelValueEvent} from "./ConvergenceValue";
import {ValueFactory} from "./ValueFactory";
import {ConvergenceArray} from "./ConvergenceArray";
import {ConvergenceModel} from "./ConvergenceModel";
import {ConvergenceValueType} from "./ConvergenceValueType";


export class ConvergenceObject extends ConvergenceContainerValue<{ [key: string]: any; }> {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: ConvergenceValue.Events.DETACHED,
    MODEL_CHANGED: ConvergenceValue.Events.MODEL_CHANGED
  };

  private _children: { [key: string]: ConvergenceValue<any>; };


  /**
   * Constructs a new RealTimeObject.
   */
  constructor(data: ObjectValue,
              parent: ConvergenceContainerValue<any>,
              fieldInParent: PathElement,
              valueFactory: ValueFactory,
              model: ConvergenceModel) {
    super(ConvergenceValueType.Object, data.id, parent, fieldInParent, valueFactory, model);

    this._children = {};

    Object.getOwnPropertyNames(data.children).forEach((prop: string) => {
      this._children[prop] =
        valueFactory.create(data.children[prop], this, prop);
    });
  }

  get(key: string): ConvergenceValue<any> {
    return this._children[key];
  }

  keys(): string[] {
    return Object.getOwnPropertyNames(this._children);
  }

  hasKey(key: string): boolean {
    return this._children.hasOwnProperty(key);
  }

  forEach(callback: (value: ConvergenceValue<any>, key?: string) => void): void {
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
    this.forEach((value: ConvergenceValue<any>, key: string) => {
      returnObject[key] = value.value();
    });
    return returnObject;
  }


  _path(pathArgs: Path): ConvergenceValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var prop: string = <string> pathArgs[0];
    var child: ConvergenceValue<any> = this._children[prop];
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

  protected _detachChildren(): void {
    this.forEach((child: ConvergenceValue<any>) => {
      child._detach();
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
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
    var key: string = operation.prop;
    var value: DataValue = operation.value;

    var newChild: ConvergenceValue<any> = this._valueFactory.create(value, this, key);
    this._children[key] = newChild;

    var event: ObjectSetEvent = {
      src: this,
      name: ConvergenceObject.Events.SET,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: key,
      value: newChild
    };

    this.emitEvent(event);
    this._bubbleModelChangedEvent(event);
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectSetPropertyOperation = <ObjectSetPropertyOperation> operationEvent.operation;
    var key: string = operation.prop;
    var value: DataValue = operation.value;

    var oldChild: ConvergenceValue<any> = this._children[key];
    oldChild._detach();

    var newChild: ConvergenceValue<any> = this._valueFactory.create(value, this, key);
    this._children[key] = newChild;

    var event: ObjectSetEvent = {
      src: this,
      name: ConvergenceObject.Events.SET,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      key: key,
      value: newChild
    };

    this.emitEvent(event);
    this._bubbleModelChangedEvent(event);
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
    var operation: ObjectRemovePropertyOperation = <ObjectRemovePropertyOperation> operationEvent.operation;
    var key: string = operation.prop;

    var oldChild: ConvergenceValue<any> = this._children[key];

    if (oldChild) {
      delete this._children[key];

      var event: ObjectRemoveEvent = {
        src: this,
        name: ConvergenceObject.Events.REMOVE,
        sessionId: operationEvent.sessionId,
        username: operationEvent.username,
        version: operationEvent.version,
        timestamp: operationEvent.timestamp,
        key: key
      };

      this.emitEvent(event);
      oldChild._detach();

      this._bubbleModelChangedEvent(event);
    }
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): ObjectSetValueEvent {
    var operation: ObjectSetOperation = <ObjectSetOperation> operationEvent.operation;
    var value: {[key: string]: DataValue} = operation.value;

    var oldChildren: Object = this._children;

    this._children = {};

    for (var prop in value) {
      if (value.hasOwnProperty(prop)) {
        this._children[prop] = this._valueFactory.create(value[prop], this, prop);
      }
    }

    var event: ObjectSetValueEvent = {
      src: this,
      name: ConvergenceObject.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
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
}

export interface ObjectSetEvent extends ModelValueEvent {
  src: ConvergenceObject;
  key: string;
  value: any;
}

export interface ObjectRemoveEvent extends ModelValueEvent {
  src: ConvergenceObject;
  key: string;
}

export interface ObjectSetValueEvent extends ModelValueEvent {
  src: ConvergenceObject;
  value: { [key: string]: any; };
}

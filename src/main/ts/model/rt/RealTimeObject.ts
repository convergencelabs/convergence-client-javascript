import {ObservableObject} from "../observable/ObservableObject";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {RealTimeValue} from "./RealTimeValue";
import {ReferenceManager} from "../reference/ReferenceManager";
import {ReferenceDisposedCallback, LocalModelReference} from "../reference/LocalModelReference";
import {ObjectValue, DataValue} from "../dataValue";
import {PathElement, Path} from "../ot/Path";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {ModelValueType} from "../ModelValueType";
import {RealTimeValueFactory} from "./RealTimeValueFactory";
import {ReferenceType, ModelReference} from "../reference/ModelReference";
import {DiscreteOperation} from "../ot/ops/DiscreteOperation";
import {ObjectSetPropertyOperation} from "../ot/ops/ObjectSetPropertyOperation";
import {ObjectAddPropertyOperation} from "../ot/ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../ot/ops/ObjectRemovePropertyOperation";
import {PropertyReference} from "../reference/PropertyReference";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {Session} from "../../Session";
import {ObjectSetOperation} from "../ot/ops/ObjectSetOperation";
import {RealTimeArray} from "./RealTimeArray";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ValueChangedEvent} from "../observable/ObservableValue";

export class RealTimeObject extends RealTimeContainerValue<{ [key: string]: any; }> implements ObservableObject {

  static Events: any = {
    SET: "set",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _children: { [key: string]: RealTimeValue<any>; };
  private _referenceManager: ReferenceManager;
  private _referenceDisposed: ReferenceDisposedCallback;

  /**
   * Constructs a new RealTimeObject.
   */
  constructor(data: ObjectValue,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(ModelValueType.Object, data.id, parent, fieldInParent, callbacks, model);

    this._children = {};

    Object.getOwnPropertyNames(data.children).forEach((prop: string) => {
      this._children[prop] =
        RealTimeValueFactory.create(data.children[prop], this, prop, this._callbacks, model);
    });

    this._referenceManager = new ReferenceManager(this, [ReferenceType.PROPERTY]);
    this._referenceDisposed = (reference: LocalModelReference<any, any>) => {
      this._referenceManager.removeLocalReference(reference.key());
    };
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

    var child: RealTimeValue<any> = RealTimeValueFactory.create(dataValue, this, key, this._callbacks, this._model);
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

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      if (ref instanceof PropertyReference) {
        ref._handlePropertyRemoved(key);
      }
    });
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

  propertyReference(key: string): LocalPropertyReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.PROPERTY) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalPropertyReference>existing;
      }
    } else {
      var session: Session = this.model().session();
      var reference: PropertyReference = new PropertyReference(key, this, session.username(), session.sessionId(), true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalPropertyReference = new LocalPropertyReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.referenceMap().get(sessionId, key);
  }

  references(sessionId?: string, key?: string): ModelReference<any>[] {
    return this._referenceManager.referenceMap().getAll(sessionId, key);
  }

  //
  // private / protected methods.
  //

  protected _getData(): { [key: string]: any; } {
    var returnObject: Object = {};
    this.forEach((model: RealTimeValue<any>, key: string) => {
      returnObject[key] = model.data();
    });
    return returnObject;
  }

  protected _setData(data?: { [key: string]: any; }): void {
    if (!data || typeof data !== "object") {
      throw new Error("Value must be an object and cannot be null or undefined!");
    }

    this.forEach((oldChild: RealTimeValue<any>) => oldChild._detach());
    this._children = {};

    var newData: {[key: string]: DataValue} = {};

    Object.getOwnPropertyNames(data).forEach((prop: string) => {
      var dataValue: DataValue = this._model._createDataValue(data[prop]);
      newData[prop] = dataValue;
      this._children[prop] =
        RealTimeValueFactory.create(dataValue, this, prop, this._callbacks, this._model);
    });

    var operation: ObjectSetOperation = new ObjectSetOperation(this.id(), false, newData);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
  }

  _path(pathArgs: Path): RealTimeValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var prop: string = <string> pathArgs[0];
    var child: RealTimeValue<any> = this._children[prop];
    if (pathArgs.length > 1) {
      if (child.type() === ModelValueType.Object) {
        return (<RealTimeObject> child).valueAt(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === ModelValueType.Array) {
        return (<RealTimeArray> child).valueAt(pathArgs.slice(1, pathArgs.length));
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

    var newChild: RealTimeValue<any> = RealTimeValueFactory.create(value, this, key, this._callbacks, this.model());
    this._children[key] = newChild;

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
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

    var oldChild: RealTimeValue<any> = this._children[key];
    oldChild._detach();

    var newChild: RealTimeValue<any> = RealTimeValueFactory.create(value, this, key, this._callbacks, this.model());
    this._children[key] = newChild;

    var event: ObjectSetEvent = {
      src: this,
      name: RealTimeObject.Events.SET,
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

    var oldChild: RealTimeValue<any> = this._children[key];

    if (oldChild) {
      delete this._children[key];

      var event: ObjectRemoveEvent = {
        src: this,
        name: RealTimeObject.Events.REMOVE,
        sessionId: operationEvent.sessionId,
        username: operationEvent.username,
        version: operationEvent.version,
        timestamp: operationEvent.timestamp,
        key: key
      };

      this.emitEvent(event);
      oldChild._detach();

      this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
        if (ref instanceof PropertyReference) {
          ref._handlePropertyRemoved(key);
        }
      });

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
        this._children[prop] = RealTimeValueFactory.create(value[prop], this, prop, this._callbacks, this.model());
      }
    }

    var event: ObjectSetValueEvent = {
      src: this,
      name: RealTimeObject.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
    this._referenceManager.removeAllLocalReferences();

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
}

export interface ObjectSetEvent extends ValueChangedEvent {
  src: RealTimeObject;
  key: string;
  value: any;
}

export interface ObjectRemoveEvent extends ValueChangedEvent {
  src: RealTimeObject;
  key: string;
}

export interface ObjectSetValueEvent extends ValueChangedEvent {
  src: RealTimeObject;
  value:  { [key: string]: any; };
}

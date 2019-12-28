/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {ModelNode} from "./ModelNode";
import {IObjectValue, IDataValue} from "../dataValue";
import {Validation} from "../../util/Validation";
import {Path} from "../Path";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {ModelNodeFactory} from "./ModelNodeFactory";
import {ObjectNodeRemoveEvent, ObjectNodeSetValueEvent, ObjectNodeSetEvent} from "./events";
import {ContainerNode} from "./ContainerNode";
import {DataValueFactory} from "../DataValueFactory";
import {
  ObjectAddProperty,
  ObjectSetProperty,
  ObjectRemoveProperty,
  ObjectSet
} from "../ot/ops/operationChanges";
import {ConvergenceSession} from "../../ConvergenceSession";
import {DomainUser} from "../../identity";

/**
 * @hidden
 * @internal
 */
export class ObjectNode extends ContainerNode<{ [key: string]: any }> {

  public static Events: any = {
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
  constructor(data: IObjectValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession,
              private dataValueFactory: DataValueFactory) {
    super(ModelElementType.OBJECT, data.id, path, model, session);

    this._children = new Map<string, ModelNode<any>>();

    Object.getOwnPropertyNames(data.value).forEach((prop: string) => {
      const child: IDataValue = data.value[prop];
      this._idToPathElement.set(child.id, prop);
      this._children.set(prop, ModelNodeFactory.create(child, this._pathCB(child.id), model,
        this._session, this.dataValueFactory));
    });

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  public dataValue(): IObjectValue {
    const values: { [key: string]: IDataValue } = {};
    this._children.forEach((value, key) => {
      values[key] = value.dataValue();
    });

    return {
      id: this.id(),
      type: "object",
      value: values
    } as IObjectValue;
  }

  public toJson(): any {
    const jsonObject: any = {};
    this.forEach((node, key) => {
      jsonObject[key] = node.toJson();
    });
    return jsonObject;
  }

  public get(key: string): ModelNode<any> {
    Validation.assertString(key, "key");
    return this._valueAt([key]);
  }

  public set(key: string, value: any): ModelNode<any> {
    const dataValue: IDataValue = this.dataValueFactory.createDataValue(value);
    this._applySet(key, dataValue, true, this._session.sessionId(), this._session.user());
    return this.get(key);
  }

  public remove(key: string): ModelNode<any> {
    const oldValue: ModelNode<any> = this._valueAt([key]);
    this._applyRemove(key, true, this._session.sessionId(), this._session.user());
    return oldValue;
  }

  public keys(): string[] {
    const keys: string[] = [];
    this._children.forEach((v, k) => {
      keys.push(k);
    });
    return keys;
  }

  public hasKey(key: string): boolean {
    return this._children.has(key);
  }

  public forEach(callback: (model: ModelNode<any>, key?: string) => void): void {
    this._children.forEach((value, key) => {
      callback(value, key);
    });
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
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

  //
  // private / protected methods.
  //

  protected _getData(): { [key: string]: any } {
    const returnObject: { [key: string]: any } = {};
    this.forEach((model: ModelNode<any>, key: string) => {
      returnObject[key] = model.data();
    });
    return returnObject;
  }

  protected _setData(data?: { [key: string]: any }): void {
    const values: { [key: string]: IDataValue } = {};

    for (const prop in data) {
      if (data.hasOwnProperty(prop)) {
        values[prop] = this.dataValueFactory.createDataValue(data[prop]);
      }
    }

    this._applySetValue(values, true, this._session.sessionId(), this._session.user());
  }

  protected _valueAt(pathArgs: Path): ModelNode<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    const prop: string = pathArgs[0] as string;
    const child: ModelNode<any> = this._children.get(prop);

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

  protected _detachChildren(local: boolean): void {
    this.forEach((child: ModelNode<any>) => {
      child._detach(local);
      child.removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });
  }

  private _pathCB(id: string): (() => Path) {
    return () => {
      const path: Path = this.path();
      path.push(this._idToPathElement.get(id));
      return path;
    };
  }

  private _applySet(key: string, value: IDataValue, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertString(key, "key");

    const oldValue = this._valueAt([key]);
    if (oldValue.type() !== ModelElementType.UNDEFINED) {
      oldValue.removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      oldValue._detach(local);
    }

    const child: ModelNode<any> = ModelNodeFactory.create(
      value, this._pathCB(value.id), this._model, this._session, this.dataValueFactory);
    child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    this._children.set(key, child);
    this._idToPathElement.set(child.id(), key);

    const event: ObjectNodeSetEvent =
      new ObjectNodeSetEvent(this, local, key, child, oldValue, sessionId, user);

    this._emitValueEvent(event);
  }

  private _applyRemove(key: string, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertString(key, "key");

    if (this._children.has(key)) {
      this._idToPathElement.delete(key);
      const oldChild = this._children.get(key);
      oldChild.removeListener(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
      oldChild._detach(local);
      this._children.delete(key);

      const event: ObjectNodeRemoveEvent =
        new ObjectNodeRemoveEvent(this, local, key, oldChild, sessionId, user);
      this._emitValueEvent(event);
    }

    // todo should we throw an error if the object doesn't have this key.
  }

  private _applySetValue(
    values: { [key: string]: IDataValue }, local: boolean, sessionId: string, user: DomainUser): void {
    this._detachChildren(local);

    this._children = new Map<string, ModelNode<any>>();

    for (const prop in values) {
      if (values.hasOwnProperty(prop)) {
        const dataValue: IDataValue = values[prop];
        this._idToPathElement.set(dataValue.id, prop);
        this._children.set(prop,
          ModelNodeFactory.create(
            dataValue, this._pathCB(dataValue.id), this.model(), this._session, this.dataValueFactory));
      }
    }

    this._children.forEach((child: ModelNode<any>) => {
      child.on(ObjectNode.Events.NODE_CHANGED, this._nodeChangedHandler);
    });

    const event: ObjectNodeSetValueEvent =
      new ObjectNodeSetValueEvent(this, local, this.data(), sessionId, user);
    this._emitValueEvent(event);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Handlers for incoming operations
  /////////////////////////////////////////////////////////////////////////////

  private _handleAddPropertyOperation(operationEvent: ModelOperationEvent): void {
    const operation: ObjectAddProperty = operationEvent.operation as ObjectAddProperty;
    this._applySet(operation.prop, operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetPropertyOperation(operationEvent: ModelOperationEvent): void {
    const operation: ObjectSetProperty = operationEvent.operation as ObjectSetProperty;
    this._applySet(operation.prop, operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleRemovePropertyOperation(operationEvent: ModelOperationEvent): void {
    const operation: ObjectRemoveProperty = operationEvent.operation as ObjectRemoveProperty;
    this._applyRemove(operation.prop, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: ObjectSet = operationEvent.operation as ObjectSet;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }
}

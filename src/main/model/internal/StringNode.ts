/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ModelNode} from "./ModelNode";
import {StringValue, DataValueType} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {StringInsertOperation} from "../ot/ops/StringInsertOperation";
import {StringRemoveOperation} from "../ot/ops/StringRemoveOperation";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {StringNodeInsertEvent, StringNodeRemoveEvent, StringNodeSetValueEvent} from "./events";
import {ConvergenceSession} from "../../ConvergenceSession";
import {DomainUser} from "../../identity";
import {Validation} from "../../util/Validation";

/**
 * @hidden
 * @internal
 */
export class StringNode extends ModelNode<string> {

  public static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: string;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(data: StringValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession) {
    super(ModelElementType.STRING, data.id, path, model, session);

    this._data = data.value;
  }

  public dataValue(): StringValue {
    return {
      id: this.id(),
      type: DataValueType.STRING,
      value: this.data()
    } as StringValue;
  }

  public toJson(): any {
    return this._data;
  }

  public insert(index: number, value: string): void {
    this._applyInsert(index, value, true, this._session.sessionId(), this._session.user());
  }

  public remove(index: number, length: number): void {
    this._applyRemove(index, length, true, this._session.sessionId(), this._session.user());
  }

  public length(): number {
    return this._data.length;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.STRING_INSERT) {
      this._handleInsertOperation(operationEvent);
    } else if (type === OperationType.STRING_REMOVE) {
      this._handleRemoveOperation(operationEvent);
    } else if (type === OperationType.STRING_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  protected _setData(data: string): void {
    this._applySetValue(data, true, this._session.sessionId(), this._session.user());
  }

  protected _getData(): string {
    return this._data;
  }

  private _applyInsert(index: number, value: string, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertValidStringIndex(index, this._data, true, "index");
    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);
    const event: StringNodeInsertEvent = new StringNodeInsertEvent(this, local, index, value, sessionId, user);
    this._emitValueEvent(event);
  }

  private _applyRemove(index: number, length: number, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertValidStringIndex(index, this._data, false, "index");
    Validation.assertValidStringIndex(index + length, this._data, true);

    const removedVal: string = this._data.slice(index, index + length);
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);

    const event: StringNodeRemoveEvent = new StringNodeRemoveEvent(this, local, index, removedVal, sessionId, user);
    this._emitValueEvent(event);
  }

  private _applySetValue(value: string, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertString(value);
    this._data = value;

    const event: StringNodeSetValueEvent = new StringNodeSetValueEvent(this, local, value, sessionId, user);
    this._emitValueEvent(event);
  }

  //
  // Operations
  //

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringInsertOperation = operationEvent.operation as StringInsertOperation;
    this._applyInsert(operation.index, operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringRemoveOperation = operationEvent.operation as StringRemoveOperation;
    this._applyRemove(operation.index, operation.value.length, false,
      operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringSetOperation = operationEvent.operation as StringSetOperation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }
}

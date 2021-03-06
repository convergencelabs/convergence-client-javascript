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

import {ModelNode} from "./ModelNode";
import {IStringValue} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {StringSetOperation} from "../ot/ops/StringSetOperation";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {StringNodeInsertEvent, StringNodeRemoveEvent, StringNodeSetValueEvent, StringNodeSpliceEvent} from "./events";
import {ConvergenceSession} from "../../ConvergenceSession";
import {DomainUser} from "../../identity";
import {Validation} from "../../util/Validation";
import {StringSpliceOperation} from "../ot/ops/StringSpliceOperation";

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
  constructor(data: IStringValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession) {
    super(ModelElementType.STRING, data.id, path, model, session);

    this._data = data.value;
  }

  public dataValue(): IStringValue {
    return {
      id: this.id(),
      type: "string",
      value: this.data()
    } as IStringValue;
  }

  public toJson(): any {
    return this._data;
  }

  public splice(index: number, deleteCount: number, inserValue: string): void {
    this._applySplice(index, deleteCount, inserValue, true, this._session.sessionId(), this._session.user());
  }

  public insert(index: number, value: string): void {
    this._applySplice(index, 0, value, true, this._session.sessionId(), this._session.user());
  }

  public remove(index: number, length: number): void {
    this._applySplice(index, length, "", true, this._session.sessionId(), this._session.user());
  }

  public length(): number {
    return this._data.length;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.STRING_SPLICE) {
      this._handleSpliceOperation(operationEvent);
    } else if (type === OperationType.STRING_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation type for a String: " + operationEvent.operation.type);
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

  private _applySplice(index: number, deleteCount: number, insertValue, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertValidStringIndex(index, this._data, true, "index");
    Validation.assertValidStringIndex(index + deleteCount, this._data, true);

    const removedVal: string = this._data.slice(index, index + deleteCount);
    this._data = this._data.slice(0, index) + insertValue + this._data.slice(index + deleteCount, this._data.length);

    if (deleteCount > 0 && insertValue.length === 0) {
      const event: StringNodeRemoveEvent = new StringNodeRemoveEvent(this, local, index, removedVal, sessionId, user);
      this._emitValueEvent(event);
    } else if (deleteCount === 0 && insertValue.length > 0) {
      const event: StringNodeInsertEvent = new StringNodeInsertEvent(this, local, index, insertValue, sessionId, user);
      this._emitValueEvent(event);
    } else if (deleteCount > 0 && insertValue.length > 0) {
      const event: StringNodeSpliceEvent = new StringNodeSpliceEvent(this, local, index, deleteCount, insertValue, sessionId, user);
      this._emitValueEvent(event);
    } else {
      // No mutation, so do not emit an event.
    }
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

  private _handleSpliceOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringSpliceOperation = operationEvent.operation as StringSpliceOperation;
    this._applySplice(operation.index, operation.deleteCount, operation.insertValue, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: StringSetOperation = operationEvent.operation as StringSetOperation;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }
}

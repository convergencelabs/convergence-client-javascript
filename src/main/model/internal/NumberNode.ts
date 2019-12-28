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
import {INumberValue} from "../dataValue";
import {Model} from "./Model";
import {ModelElementType} from "../ModelElementType";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {NumberNodeDeltaEvent, NumberNodeSetValueEvent} from "./events";
import {NumberDelta, NumberSet} from "../ot/ops/operationChanges";
import {ConvergenceSession} from "../../ConvergenceSession";
import {DomainUser} from "../../identity";

/**
 * @hidden
 * @internal
 */
export class NumberNode extends ModelNode<number> {

  public static Events: any = {
    DELTA: "delta",
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: number;

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(data: INumberValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession) {
    super(ModelElementType.NUMBER, data.id, path, model, session);

    this._data = data.value;
  }

  public dataValue(): INumberValue {
    return {
      id: this.id(),
      type: "number",
      value: this.data()
    } as INumberValue;
  }

  public toJson(): any {
    return this._data;
  }

  public add(value: number): void {
    this._applyDelta(value, true, this._session.sessionId(), this._session.user());
  }

  public subtract(value: number): void {
    this.add(-value);
  }

  public increment(): void {
    this.add(1);
  }

  public decrement(): void {
    this.add(-1);
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.NUMBER_DELTA) {
      this._handleAddOperation(operationEvent);
    } else if (type === OperationType.NUMBER_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  protected _setData(data: number): void {
    this._applySet(data, true, this._session.sessionId(), this._session.user());
  }

  protected _getData(): number {
    return this._data;
  }

  private _applyDelta(delta: number, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateNumber(delta);

    if (delta !== 0) {
      this._data += delta;

      const event: NumberNodeDeltaEvent = new NumberNodeDeltaEvent(this, local, delta, sessionId, user);
      this._emitValueEvent(event);
    }
  }

  private _applySet(value: number, local: boolean, sessionId: string, user: DomainUser): void {
    this._validateNumber(value);
    this._data = value;

    const event: NumberNodeSetValueEvent = new NumberNodeSetValueEvent(this, local, value, sessionId, user);
    this._emitValueEvent(event);
  }

  // Handlers for incoming operations
  private _handleAddOperation(operationEvent: ModelOperationEvent): void {
    const operation: NumberDelta = operationEvent.operation as NumberDelta;
    this._applyDelta(operation.delta, false, operationEvent.sessionId, operationEvent.user);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: NumberSet = operationEvent.operation as NumberSet;
    this._applySet(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }

  private _validateNumber(value: number): void {
    if (typeof value !== "number") {
      throw new Error(`The value must be a number but was: ${typeof value}`);
    }

    if (isNaN(value)) {
      throw new Error("The delta must not be NaN");
    }
  }
}

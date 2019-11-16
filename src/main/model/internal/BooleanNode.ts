/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {ModelNode} from "./ModelNode";
import {BooleanValue, DataValueType} from "../dataValue";
import {ModelElementType} from "../ModelElementType";
import {Model} from "./Model";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {Path} from "../Path";
import {BooleanNodeSetValueEvent} from "./events";
import {BooleanSet} from "../ot/ops/operationChanges";
import {ConvergenceSession} from "../../ConvergenceSession";
import {DomainUser} from "../../identity";
import {Validation} from "../../util/Validation";

/**
 * @hidden
 * @internal
 */
export class BooleanNode extends ModelNode<boolean> {

  public static Events: any = {
    VALUE: "value",
    DETACHED: ModelNode.Events.DETACHED,
    MODEL_CHANGED: ModelNode.Events.MODEL_CHANGED
  };

  private _data: boolean;

  /**
   * Constructs a new RealTimeBoolean.
   */
  constructor(data: BooleanValue,
              path: () => Path,
              model: Model,
              session: ConvergenceSession) {
    super(ModelElementType.BOOLEAN, data.id, path, model, session);
    this._data = data.value;
  }

  public dataValue(): BooleanValue {
    return {
      id: this.id(),
      type: DataValueType.BOOLEAN,
      value: this.data()
    } as BooleanValue;
  }

  public toJson(): any {
    return this._data;
  }

  public _handleModelOperationEvent(operationEvent: ModelOperationEvent): void {
    const type: string = operationEvent.operation.type;
    if (type === OperationType.BOOLEAN_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  //
  // private and protected methods
  //

  protected _setData(value: boolean): void {
    this._applySetValue(value, true, this._session.sessionId(), this._session.user());
  }

  protected _getData(): boolean {
    return this._data;
  }

  private _applySetValue(value: boolean, local: boolean, sessionId: string, user: DomainUser): void {
    Validation.assertBoolean(value);
    this._data = value;
    const event: BooleanNodeSetValueEvent = new BooleanNodeSetValueEvent(this, local, value, sessionId, user);
    this._emitValueEvent(event);
  }

  // Handlers for incoming operations

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    const operation: BooleanSet = operationEvent.operation as BooleanSet;
    this._applySetValue(operation.value, false, operationEvent.sessionId, operationEvent.user);
  }
}

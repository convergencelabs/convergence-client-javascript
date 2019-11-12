/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";
import {ArraySet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ArraySetOperation extends DiscreteOperation implements ArraySet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: DataValue[]) {
    super(OperationType.ARRAY_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ArraySetOperation {
    return new ArraySetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

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
import {ArrayInsert} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ArrayInsertOperation extends DiscreteOperation implements ArrayInsert {

  constructor(
    id: string,
    noOp: boolean,
    public readonly index: number,
    public readonly value: DataValue) {
    super(OperationType.ARRAY_INSERT, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ArrayInsertOperation {
    return new ArrayInsertOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

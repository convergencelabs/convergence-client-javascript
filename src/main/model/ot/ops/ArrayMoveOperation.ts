/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {ArrayMove} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ArrayMoveOperation extends DiscreteOperation implements ArrayMove {

  constructor(
    id: string,
    noOp: boolean,
    public readonly fromIndex: number,
    public readonly toIndex: number) {
    super(OperationType.ARRAY_REORDER, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ArrayMoveOperation {
    return new ArrayMoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.fromIndex, updates.fromIndex),
      Immutable.update(this.toIndex, updates.toIndex));
  }
}

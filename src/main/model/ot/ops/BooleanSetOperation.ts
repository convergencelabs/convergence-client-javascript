/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {BooleanSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class BooleanSetOperation extends DiscreteOperation implements BooleanSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: boolean) {
    super(OperationType.BOOLEAN_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): BooleanSetOperation {
    return new BooleanSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

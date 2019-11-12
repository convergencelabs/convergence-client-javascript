/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {NumberSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class NumberSetOperation extends DiscreteOperation implements NumberSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: number) {
    super(OperationType.NUMBER_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): NumberSetOperation {
    return new NumberSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

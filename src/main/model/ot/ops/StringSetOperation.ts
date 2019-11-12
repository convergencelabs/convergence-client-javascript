/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DiscreteOperation} from "./DiscreteOperation";
import {Immutable} from "../../../util/Immutable";
import {OperationType} from "./OperationType";
import {StringSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class StringSetOperation extends DiscreteOperation implements StringSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: string) {
    super(OperationType.STRING_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): StringSetOperation {
    return new StringSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

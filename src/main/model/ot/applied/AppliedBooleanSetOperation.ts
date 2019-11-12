/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {BooleanSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedBooleanSetOperation extends AppliedDiscreteOperation implements BooleanSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: boolean,
              public readonly oldValue: boolean) {
    super(OperationType.BOOLEAN_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedBooleanSetOperation {
    return new AppliedBooleanSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

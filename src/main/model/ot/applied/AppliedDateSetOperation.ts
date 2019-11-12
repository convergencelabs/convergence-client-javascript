/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {DateSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedDateSetOperation extends AppliedDiscreteOperation implements DateSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: Date,
              public readonly oldValue: Date) {
    super(OperationType.DATE_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedDateSetOperation {
    return new AppliedDateSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {NumberDelta} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedNumberDeltaOperation extends AppliedDiscreteOperation implements NumberDelta {

  constructor(id: string,
              noOp: boolean,
              public readonly delta: number) {
    super(OperationType.NUMBER_DELTA, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedNumberDeltaOperation {
    return new AppliedNumberDeltaOperation(this.id, this.noOp, -this.delta);
  }
}

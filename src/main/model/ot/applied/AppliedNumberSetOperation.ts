/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {OperationType} from "../ops/OperationType";
import {NumberSet} from "../ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export class AppliedNumberSetOperation extends AppliedDiscreteOperation implements NumberSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: number,
              public readonly oldValue: number) {
    super(OperationType.NUMBER_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedNumberSetOperation {
    return new AppliedNumberSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

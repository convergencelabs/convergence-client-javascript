/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedStringSetOperation extends AppliedDiscreteOperation implements StringSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: string,
              public readonly oldValue: string) {
    super(OperationType.STRING_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedStringSetOperation {
    return new AppliedStringSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

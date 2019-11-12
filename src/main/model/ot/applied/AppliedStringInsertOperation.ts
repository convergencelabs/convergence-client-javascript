/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {AppliedStringRemoveOperation} from "./AppliedStringRemoveOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringInsert} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedStringInsertOperation extends AppliedDiscreteOperation implements StringInsert {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: string) {
    super(OperationType.STRING_INSERT, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

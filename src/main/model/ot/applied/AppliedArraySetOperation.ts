/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArraySet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedArraySetOperation extends AppliedDiscreteOperation implements ArraySet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: DataValue[],
              public readonly oldValue: DataValue[]) {
    super(OperationType.ARRAY_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArraySetOperation {
    return new AppliedArraySetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedArrayInsertOperation} from "./AppliedArrayInsertOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArrayRemove} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedArrayRemoveOperation extends AppliedDiscreteOperation implements ArrayRemove {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly oldValue: DataValue) {
    super(OperationType.ARRAY_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArrayInsertOperation {
    return new AppliedArrayInsertOperation(this.id, this.noOp, this.index, this.oldValue);
  }
}

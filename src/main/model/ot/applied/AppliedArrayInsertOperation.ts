/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedArrayRemoveOperation} from "./AppliedArrayRemoveOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArrayInsert} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedArrayInsertOperation extends AppliedDiscreteOperation implements ArrayInsert {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: DataValue) {
    super(OperationType.ARRAY_INSERT, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArrayRemoveOperation {
    return new AppliedArrayRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

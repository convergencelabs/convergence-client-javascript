/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectSet} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetOperation extends AppliedDiscreteOperation implements ObjectSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: {[key: string]: DataValue},
              public readonly oldValue: {[key: string]: DataValue}) {
    super(OperationType.OBJECT_VALUE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectSetOperation {
    return new AppliedObjectSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

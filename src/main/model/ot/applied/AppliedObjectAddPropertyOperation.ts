/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedObjectRemovePropertyOperation} from "./AppliedObjectRemovePropertyOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectAddProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectAddPropertyOperation extends AppliedDiscreteOperation implements ObjectAddProperty {

  constructor(id: string,
              noOp: boolean,
              public readonly prop: string,
              public readonly value: DataValue) {
    super(OperationType.OBJECT_ADD, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectRemovePropertyOperation {
    return new AppliedObjectRemovePropertyOperation(this.id, this.noOp, this.prop, this.value);
  }
}

/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {DataValue} from "../../dataValue";
import {AppliedObjectAddPropertyOperation} from "./AppliedObjectAddPropertyOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectRemoveProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectRemovePropertyOperation extends AppliedDiscreteOperation implements ObjectRemoveProperty {

  protected _prop: string;

  constructor(id: string,
              noOp: boolean,
              public readonly prop: string,
              public readonly oldValue: DataValue) {
    super(OperationType.OBJECT_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectAddPropertyOperation {
    return new AppliedObjectAddPropertyOperation(this.id, this.noOp, this.prop, this.oldValue);
  }
}

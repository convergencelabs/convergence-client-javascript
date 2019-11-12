/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";
import {ObjectSetProperty} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ObjectSetPropertyOperation extends DiscreteOperation implements ObjectSetProperty {

  constructor(id: string,
              noOp: boolean,
              public readonly prop: string,
              public readonly value: DataValue) {
    super(OperationType.OBJECT_SET, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

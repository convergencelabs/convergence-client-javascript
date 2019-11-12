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
import {ObjectAddProperty} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ObjectAddPropertyOperation extends DiscreteOperation implements ObjectAddProperty {

  constructor(id: string,
              noOp: boolean,
              public readonly prop: string,
              public readonly value: DataValue) {
    super(OperationType.OBJECT_ADD, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

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
import {ObjectSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class ObjectSetOperation extends DiscreteOperation implements ObjectSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: { [key: string]: DataValue }) {
    super(OperationType.OBJECT_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ObjectSetOperation {
    return new ObjectSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

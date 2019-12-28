/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IDataValue} from "../../dataValue";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ObjectSetProperty} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedObjectSetPropertyOperation extends AppliedDiscreteOperation implements ObjectSetProperty {

  constructor(id: string,
              noOp: boolean,
              public readonly prop: string,
              public readonly value: IDataValue,
              public readonly oldValue: IDataValue) {
    super(OperationType.OBJECT_SET, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedObjectSetPropertyOperation {
    return new AppliedObjectSetPropertyOperation(this.id, this.noOp, this.prop, this.oldValue, this.value);
  }
}

/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {Operation} from "../ops/Operation";
import {CompoundOperation} from "../ops/CompoundOperation";
import {DiscreteOperation} from "../ops/DiscreteOperation";
import {TransformationFunctionRegistry} from "./TransformationFunctionRegistry";
import {ReferenceTransformationFunction} from "./ReferenceTransformationFunction";
import {ReferenceType} from "../../reference/ReferenceType";

/**
 * @hidden
 * @internal
 */
export interface ModelReferenceData {
  type: ReferenceType;
  valueId: string;
  values: any[];
}

/**
 * @hidden
 * @internal
 */
export class ReferenceTransformer {
  private _tfr: TransformationFunctionRegistry;

  constructor(tfr: TransformationFunctionRegistry) {
    this._tfr = tfr;
  }

  public transform(o: Operation, r: ModelReferenceData): ModelReferenceData {
    if (o instanceof CompoundOperation) {
      return this.transformCompoundOperation(o, r);
    } else {
      return this.transformDiscreteOperation(o as DiscreteOperation, r);
    }
  }

  private transformCompoundOperation(o: CompoundOperation, r: ModelReferenceData): ModelReferenceData {
    let result: ModelReferenceData = r;
    for (let i: number = 0; i < o.ops.length && result; i++) {
      result = this.transform(o.ops[i], result);
    }
    return result;
  }

  private transformDiscreteOperation(s: DiscreteOperation, r: ModelReferenceData): ModelReferenceData {
    if (s.noOp) {
      return r;
    } else if (s.id === r.valueId) {
      return this.transformWithIdenticalPathOperation(s, r);
    } else {
      return r;
    }
  }

  private transformWithIdenticalPathOperation(o: DiscreteOperation, r: ModelReferenceData): ModelReferenceData {
    const tf: ReferenceTransformationFunction = this._tfr.getReferenceTransformationFunction(o, r);
    if (tf) {
      return tf(o, r);
    } else {
      throw new Error(
        `No function found for: (${o.type},${r.type})`);
    }
  }
}

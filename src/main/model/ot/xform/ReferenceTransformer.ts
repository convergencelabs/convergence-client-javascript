/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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

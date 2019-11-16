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

import {Operation} from "../ops/Operation";
import {CompoundOperation} from "../ops/CompoundOperation";
import {OperationPair} from "./OperationPair";
import {DiscreteOperation} from "../ops/DiscreteOperation";
import {TransformationFunctionRegistry} from "./TransformationFunctionRegistry";
import {OperationTransformationFunction} from "./OperationTransformationFunction";

/**
 * @hidden
 * @internal
 */
export class OperationTransformer {
  private _tfr: TransformationFunctionRegistry;

  constructor(tfr: TransformationFunctionRegistry) {
    this._tfr = tfr;
  }

  public transform(s: Operation, c: Operation): OperationPair {
    if (s instanceof CompoundOperation) {
      return this.transformServerCompoundOperation(s, c);
    } else if (c instanceof CompoundOperation) {
      return this.transformClientCompoundOperation(s, c);
    } else {
      return this.transformTwoDiscreteOps(s as DiscreteOperation, c as DiscreteOperation);
    }
  }

  private transformClientCompoundOperation(s: Operation, c: CompoundOperation): OperationPair {
    let xFormedS: Operation = s;
    const newOps: DiscreteOperation[] = c.ops.map((o: DiscreteOperation) => {
      const opPair: OperationPair = this.transform(xFormedS, o);
      xFormedS = opPair.serverOp;
      return opPair.clientOp as DiscreteOperation;
    });
    return new OperationPair(xFormedS, new CompoundOperation(newOps));
  }

  private transformServerCompoundOperation(s: CompoundOperation, c: Operation): OperationPair {
    let xFormedC: Operation = c;
    const newOps: DiscreteOperation[] = s.ops.map((o: DiscreteOperation) => {
      const opPair: OperationPair = this.transform(o, xFormedC);
      xFormedC = opPair.clientOp;
      return opPair.serverOp as DiscreteOperation;
    });
    return new OperationPair(new CompoundOperation(newOps), xFormedC);
  }

  private transformTwoDiscreteOps(s: DiscreteOperation, c: DiscreteOperation): OperationPair {
    if (s.noOp || c.noOp) {
      return new OperationPair(s, c);
    } else if (s.id === c.id) {
      return this.transformIdenticalPathOperations(s, c);
    }  else {
      return new OperationPair(s, c);
    }
  }

  private transformIdenticalPathOperations(s: DiscreteOperation, c: DiscreteOperation): OperationPair {
    const tf: OperationTransformationFunction<any, any> = this._tfr.getOperationTransformationFunction(s, c);
    if (tf) {
      return tf(s, c);
    } else {
      throw new Error(
        `No function found for: (${s.type},${s.type})`);
    }
  }
}

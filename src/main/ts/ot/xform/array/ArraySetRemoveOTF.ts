/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetRemoveOTF implements OperationTransformationFunction<ArraySetOperation, ArrayRemoveOperation> {
    transform(s: ArraySetOperation, c: ArrayRemoveOperation): OperationPair {
      // A-SR-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

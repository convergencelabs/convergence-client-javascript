/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayReplaceSetOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArraySetOperation> {
    transform(s: ArrayReplaceOperation, c: ArraySetOperation): OperationPair {
      // A-PS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

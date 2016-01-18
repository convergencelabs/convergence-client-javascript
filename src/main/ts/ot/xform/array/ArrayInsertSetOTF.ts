/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayInsertSetOTF implements OperationTransformationFunction<ArrayInsertOperation, ArraySetOperation> {
    transform(s: ArrayInsertOperation, c: ArraySetOperation): OperationPair {
      // A-IS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

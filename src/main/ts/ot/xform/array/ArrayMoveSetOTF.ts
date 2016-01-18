/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayMoveSetOTF implements OperationTransformationFunction<ArrayMoveOperation, ArraySetOperation> {
    transform(s: ArrayMoveOperation, c: ArraySetOperation): OperationPair {
      // A-MS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

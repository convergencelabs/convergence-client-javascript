/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetMoveOTF implements OperationTransformationFunction<ArraySetOperation, ArrayMoveOperation> {
    transform(s:ArraySetOperation, c:ArrayMoveOperation):OperationPair {
      // A-SM-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

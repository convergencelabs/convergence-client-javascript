/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetReplaceOTF implements OperationTransformationFunction<ArraySetOperation, ArrayReplaceOperation> {
    transform(s:ArraySetOperation, c:ArrayReplaceOperation):OperationPair {
      // A-SP-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

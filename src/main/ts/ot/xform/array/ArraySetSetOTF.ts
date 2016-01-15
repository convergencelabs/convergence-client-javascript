/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetSetOTF implements OperationTransformationFunction<ArraySetOperation, ArraySetOperation> {
    transform(s:ArraySetOperation, c:ArraySetOperation):OperationPair {
      if (s.value != c.value) {
        // A-SS-1
        return new OperationPair(s, c.copy({noOp: true}));
      } else {
        // A-SS-2
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class NumberSetSetOTF implements OperationTransformationFunction<NumberSetOperation, NumberSetOperation> {
    transform(s:NumberSetOperation, c:NumberSetOperation):OperationPair {
      if (s.value == c.value) {
        // N-SS-1
        return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
      } else {
        // N-SS-2
        return new OperationPair(s, c.copy({noOp: true}));
      }
    }
  }
}

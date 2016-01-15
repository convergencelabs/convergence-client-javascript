/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class NumberAddSetOTF implements OperationTransformationFunction<NumberAddOperation, NumberSetOperation> {
    transform(s:NumberAddOperation, c:NumberSetOperation):OperationPair {
      // N-AS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

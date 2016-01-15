/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class NumberAddAddOTF implements OperationTransformationFunction<NumberAddOperation, NumberAddOperation> {
    transform(s:NumberAddOperation, c:NumberAddOperation):OperationPair {
      // N-AA-1
      return new OperationPair(s, c);
    }
  }
}

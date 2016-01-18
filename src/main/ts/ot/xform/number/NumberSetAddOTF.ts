/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class NumberSetAddOTF implements OperationTransformationFunction<NumberSetOperation, NumberAddOperation> {
    transform(s: NumberSetOperation, c: NumberAddOperation): OperationPair {
      // N-SA-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

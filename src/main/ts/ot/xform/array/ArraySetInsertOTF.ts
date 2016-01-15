/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetInsertOTF implements OperationTransformationFunction<ArraySetOperation, ArrayInsertOperation> {
    transform(s:ArraySetOperation, c:ArrayInsertOperation):OperationPair {
      // A-SI-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

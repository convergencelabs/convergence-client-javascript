/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class StringSetInsertOTF implements OperationTransformationFunction<StringSetOperation, StringInsertOperation> {
    transform(s:StringSetOperation, c:StringInsertOperation):OperationPair {
      // S-SI-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

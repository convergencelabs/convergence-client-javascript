/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class StringInsertSetOTF implements OperationTransformationFunction<StringInsertOperation, StringSetOperation> {
    transform(s:StringInsertOperation, c:StringSetOperation):OperationPair {
      // S-IS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

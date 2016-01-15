/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class StringSetRemoveOTF implements OperationTransformationFunction<StringSetOperation, StringRemoveOperation> {
    transform(s:StringSetOperation, c:StringRemoveOperation):OperationPair {
      // S-SR-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayInsertReplaceOTF implements OperationTransformationFunction<ArrayInsertOperation, ArrayReplaceOperation> {
    transform(s:ArrayInsertOperation, c:ArrayReplaceOperation):OperationPair {
      if (s.index <= c.index) {
        // A-IP-1 and A-IP-2
        return new OperationPair(s, c.copy({index: c.index + 1}));
      } else {
        // A-IP-3
        return new OperationPair(s, c);
      }
    }
  }
}

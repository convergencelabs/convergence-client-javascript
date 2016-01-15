/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayReplaceInsertOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArrayInsertOperation> {
    transform(s:ArrayReplaceOperation, c:ArrayInsertOperation):OperationPair {
      if (s.index < c.index) {
        // A-PI-1
        return new OperationPair(s, c);
      } else {
        // A-PI-2 and A-PI-3
        return new OperationPair(s.copy({index: s.index + 1}), c);
      }
    }
  }
}

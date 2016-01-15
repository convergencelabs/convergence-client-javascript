/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayRemoveReplaceOTF implements OperationTransformationFunction<ArrayRemoveOperation, ArrayReplaceOperation> {
    transform(s:ArrayRemoveOperation, c:ArrayReplaceOperation):OperationPair {
      if (s.index < c.index) {
        // A-RP-1
        return new OperationPair(s, c.copy({index: c.index - 1}));
      } else if (s.index == c.index) {
        // A-RP-2
        return new OperationPair(s.copy({noOp: true}), new ArrayInsertOperation(
          c.path, c.noOp, c.index, c.value));
      }  else {
        // A-RP-3
        return new OperationPair(s, c);
      }
    }
  }
}

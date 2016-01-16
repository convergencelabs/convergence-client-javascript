/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayReplaceReplaceOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArrayReplaceOperation> {
    transform(s:ArrayReplaceOperation, c:ArrayReplaceOperation):OperationPair {
      if (s.index != c.index) {
        // A-PP-1
        return new OperationPair(s, c)
      } else if (!EqualsUtil.deepEquals(s.value, c.value)) {
        // A-PP-2
        return new OperationPair(s, c.copy({noOp: true}));
      } else {
        // A-PP-3
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

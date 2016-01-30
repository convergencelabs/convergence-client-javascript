/// <reference path="../OperationTransformationFunction.ts" />
/// <reference path="../../../util/EqualsUtil.ts" />

module convergence.ot {
  import EqualsUtil = convergence.util.EqualsUtil;
  export class ArraySetSetOTF implements OperationTransformationFunction<ArraySetOperation, ArraySetOperation> {
    transform(s: ArraySetOperation, c: ArraySetOperation): OperationPair {
      if (!EqualsUtil.deepEquals(s.value, c.value)) {
        // A-SS-1
        return new OperationPair(s, c.copy({noOp: true}));
      } else {
        // A-SS-2
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

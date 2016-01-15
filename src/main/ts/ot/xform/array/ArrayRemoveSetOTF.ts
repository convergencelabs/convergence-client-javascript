/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayRemoveSetOTF implements OperationTransformationFunction<ArrayRemoveOperation, ArraySetOperation> {
    transform(s:ArrayRemoveOperation, c:ArraySetOperation):OperationPair {
      // A-RS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

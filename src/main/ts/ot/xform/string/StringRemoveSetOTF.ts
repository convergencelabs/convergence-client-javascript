/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class StringRemoveSetOTF implements OperationTransformationFunction<StringRemoveOperation, StringSetOperation> {
    transform(s: StringRemoveOperation, c: StringSetOperation): OperationPair {
      // S-RS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

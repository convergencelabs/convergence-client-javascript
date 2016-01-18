/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectRemovePropertySetOTF implements OperationTransformationFunction<ObjectRemovePropertyOperation, ObjectSetOperation> {
    transform(s: ObjectRemovePropertyOperation, c: ObjectSetOperation): OperationPair {
      // O-RS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

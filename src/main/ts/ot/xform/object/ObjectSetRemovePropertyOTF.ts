/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetRemovePropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectRemovePropertyOperation> {
    transform(s:ObjectSetOperation, c:ObjectRemovePropertyOperation):OperationPair {
      // O-SR-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

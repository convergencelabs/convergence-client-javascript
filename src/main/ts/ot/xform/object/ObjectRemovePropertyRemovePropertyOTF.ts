/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectRemovePropertyRemovePropertyOTF implements OperationTransformationFunction<ObjectRemovePropertyOperation, ObjectRemovePropertyOperation> {
    transform(s:ObjectRemovePropertyOperation, c:ObjectRemovePropertyOperation):OperationPair {
      if (s.prop != c.prop) {
        // O-RR-1
        return new OperationPair(s, c);
      } else {
        // O-RR-2
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

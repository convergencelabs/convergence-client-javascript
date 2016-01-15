/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetPropertyRemovePropertyOTF implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectRemovePropertyOperation> {
    transform(s:ObjectSetPropertyOperation, c:ObjectRemovePropertyOperation):OperationPair {
      if (s.prop != c.prop) {
        // O-TR-1
        return new OperationPair(s, c);
      } else {
        // O-TR-2
        return new OperationPair(
          new ObjectAddPropertyOperation(s.path, s.noOp, s.prop, s.value),
          c.copy({noOp: true}));
      }
    }
  }
}

/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectRemovePropertySetPropertyOTF implements OperationTransformationFunction<ObjectRemovePropertyOperation, ObjectSetPropertyOperation> {
    transform(s: ObjectRemovePropertyOperation, c: ObjectSetPropertyOperation): OperationPair {
      if (s.prop != c.prop) {
        // O-RT-1
        return new OperationPair(s, c)
      } else {
        // O-RT-2
        return new OperationPair(
          s.copy({noOp: true}),
          new ObjectAddPropertyOperation(c.path, c.noOp, c.prop, c.value));
      }
    }
  }
}

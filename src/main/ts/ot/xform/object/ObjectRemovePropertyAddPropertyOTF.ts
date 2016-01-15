/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectRemovePropertyAddPropertyOTF implements OperationTransformationFunction<ObjectRemovePropertyOperation, ObjectAddPropertyOperation> {
    transform(s:ObjectRemovePropertyOperation, c:ObjectAddPropertyOperation):OperationPair {
      if (s.prop != c.prop) {
        // O-RA-1
        return new OperationPair(s, c)
      } else {
        // O-RA-2
        throw new Error("Remove property and add property can not target the same property")
      }
    }
  }
}

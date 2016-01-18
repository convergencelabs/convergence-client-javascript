/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectAddPropertySetPropertyOTF implements OperationTransformationFunction<ObjectAddPropertyOperation, ObjectSetPropertyOperation> {
    transform(s: ObjectAddPropertyOperation, c: ObjectSetPropertyOperation): OperationPair {
      if (s.prop != c.prop) {
        // O-AT-1
        return new OperationPair(s, c);
      } else {
        // O-AT-2
        throw new Error("Add property and set property can not target the same property")
      }
    }
  }
}

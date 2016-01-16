/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetPropertySetPropertyOTF implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectSetPropertyOperation> {
    transform(s:ObjectSetPropertyOperation, c:ObjectSetPropertyOperation):OperationPair {
      if (s.prop != c.prop) {
        // O-TT-1
        return new OperationPair(s, c);
      } else if (s.value != c.value) {
        // O-TT-2
        return new OperationPair(s, c.copy({noOp: true}));
      } else {
        // O-TT-3
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

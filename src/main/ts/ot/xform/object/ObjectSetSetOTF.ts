/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetSetOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectSetOperation> {
    transform(s:ObjectSetOperation, c:ObjectSetOperation):OperationPair {
      if (s.value != c.value) {
        // O-SS-1
        return new OperationPair(s, c.copy({noOp: true}));
      } else {
        // O-SS-2
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      }
    }
  }
}

/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectAddPropertySetOTF implements OperationTransformationFunction<ObjectAddPropertyOperation, ObjectSetOperation> {
    transform(s:ObjectAddPropertyOperation, c:ObjectSetOperation):OperationPair {
      // O-AS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

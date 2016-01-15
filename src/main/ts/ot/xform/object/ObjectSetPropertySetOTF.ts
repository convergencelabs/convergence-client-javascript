/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetPropertySetOTF implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectSetOperation> {
    transform(s:ObjectSetPropertyOperation, c:ObjectSetOperation):OperationPair {
      // O-TS-1
      return new OperationPair(s.copy({noOp: true}), c);
    }
  }
}

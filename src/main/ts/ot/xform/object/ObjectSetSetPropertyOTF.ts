/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetSetPropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectSetPropertyOperation> {
    transform(s: ObjectSetOperation, c: ObjectSetPropertyOperation): OperationPair {
      // O-ST-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

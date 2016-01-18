/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetAddPropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectAddPropertyOperation> {
    transform(s: ObjectSetOperation, c: ObjectAddPropertyOperation): OperationPair {
      // O-SA-1
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

/// <reference path="OperationPair.ts" />

module convergence.ot {
  export interface OperationTransformationFunction<S extends DiscreteOperation, C extends DiscreteOperation> {
    transform(s: S, c: C): OperationPair;
  }
}

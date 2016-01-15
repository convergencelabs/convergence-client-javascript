/// <reference path="OperationPair.ts" />

module convergence.ot {
  export interface OperationTransformationFunction<S, C> {
    transform(s:S, c:C): OperationPair
  }
}
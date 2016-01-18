/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArraySetPTF implements PathTransformationFunction<ArraySetOperation> {
    transformDescendantPath(ancestor: ArraySetOperation, descendantPath: Array<string | number>): PathTransformation {
      return new PathTransformation(PathTransformationResult.PathObsoleted, null);
    }
  }
}

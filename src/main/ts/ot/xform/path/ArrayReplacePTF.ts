/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayReplacePTF implements PathTransformationFunction<ArrayReplaceOperation> {
    transformDescendantPath(ancestor: ArrayReplaceOperation, descendantPath: Array<string | number>): PathTransformation {
      var ancestorPathLength = ancestor.path.length;
      var descendantArrayIndex = <number>descendantPath[ancestorPathLength];

      if (ancestor.index === descendantArrayIndex) {
        return new PathTransformation(PathTransformationResult.PathObsoleted, null);
      } else {
        return new PathTransformation(PathTransformationResult.NoTransformation, null);
      }
    }
  }
}

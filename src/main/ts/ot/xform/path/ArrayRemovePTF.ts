/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ArrayRemovePTF implements PathTransformationFunction<ArrayRemoveOperation> {
    transformDescendantPath(ancestor:ArrayRemoveOperation, descendantPath:Array<string | number>):PathTransformation {
      var ancestorPathLength = ancestor.path.length;
      var descendantArrayIndex = <number>descendantPath[ancestorPathLength];

      if (ancestor.index < descendantArrayIndex) {
        var newPath = descendantPath.slice(0);
        newPath[ancestorPathLength] = descendantArrayIndex - 1;
        return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
      } else if (ancestor.index == descendantArrayIndex) {
        return new PathTransformation(PathTransformationResult.PathObsoleted, newPath);
      } else {
        return new PathTransformation(PathTransformationResult.NoTransformation, newPath);
      }
    }
  }
}

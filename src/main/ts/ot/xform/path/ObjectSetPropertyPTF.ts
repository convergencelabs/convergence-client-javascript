/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetPropertyPTF implements PathTransformationFunction<ObjectSetPropertyOperation> {
    transformDescendantPath(ancestor:ObjectSetPropertyOperation, descendantPath:Array<string | number>):PathTransformation {
      var ancestorPathLength = ancestor.path.length;
      var commonProperty = descendantPath[ancestorPathLength];

      if (ancestor.prop == commonProperty) {
        return new PathTransformation(PathTransformationResult.PathObsoleted, null);
      } else {
        return new PathTransformation(PathTransformationResult.NoTransformation, null);
      }
    }
  }
}

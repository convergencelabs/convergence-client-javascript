/// <reference path="../OperationTransformationFunction.ts" />

module convergence.ot {
  export class ObjectSetPTF implements PathTransformationFunction<ObjectSetOperation> {
    transformDescendantPath(ancestor: ObjectSetOperation, descendantPath: Array<string | number>): PathTransformation {
      return new PathTransformation(PathTransformationResult.PathObsoleted, null);
    }
  }
}

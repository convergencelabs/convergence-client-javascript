import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayMoveOperation from "../../ops/ArrayMoveOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ArrayMovePTF implements PathTransformationFunction<ArrayMoveOperation> {
  transformDescendantPath(ancestor: ArrayMoveOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength = ancestor.path.length;
    var descendantArrayIndex = <number>descendantPath[ancestorPathLength];

    if (ancestor.fromIndex < descendantArrayIndex && ancestor.toIndex > descendantArrayIndex) {
      // moved from before to after.  Decrement the index
      var newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantArrayIndex - 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else if (ancestor.fromIndex > descendantArrayIndex && ancestor.toIndex <= descendantArrayIndex) {
      // moved from after to before (or at) the index.  Increment the index.
      var newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantArrayIndex + 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else if (ancestor.fromIndex === descendantArrayIndex) {
      // The descendant path is being moved.
      var newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = ancestor.toIndex;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

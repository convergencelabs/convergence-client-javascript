import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayMoveOperation from "../../ops/ArrayMoveOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";
import {Path} from "../../Path";

export default class ArrayMovePTF implements PathTransformationFunction<ArrayMoveOperation> {
  transformDescendantPath(ancestor: ArrayMoveOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength: number = ancestor.path.length;
    var descendantArrayIndex: number = <number>descendantPath[ancestorPathLength];
    var newPath: Path;

    if (ancestor.fromIndex < descendantArrayIndex && ancestor.toIndex > descendantArrayIndex) {
      // moved from before to after.  Decrement the index
      newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantArrayIndex - 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else if (ancestor.fromIndex > descendantArrayIndex && ancestor.toIndex <= descendantArrayIndex) {
      // moved from after to before (or at) the index.  Increment the index.
      newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantArrayIndex + 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else if (ancestor.fromIndex === descendantArrayIndex) {
      // The descendant path is being moved.
      newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = ancestor.toIndex;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

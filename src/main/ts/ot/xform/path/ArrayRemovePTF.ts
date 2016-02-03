import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayRemoveOperation from "../../ops/ArrayRemoveOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";
import {Path} from "../../Path";

export default class ArrayRemovePTF implements PathTransformationFunction<ArrayRemoveOperation> {
  transformDescendantPath(ancestor: ArrayRemoveOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength: number = ancestor.path.length;
    var descendantArrayIndex: number = <number>descendantPath[ancestorPathLength];

    if (ancestor.index < descendantArrayIndex) {
      var newPath: Path = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantArrayIndex - 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else if (ancestor.index === descendantArrayIndex) {
      return new PathTransformation(PathTransformationResult.PathObsoleted, newPath);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, newPath);
    }
  }
}

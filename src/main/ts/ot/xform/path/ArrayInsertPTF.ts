import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ArrayInsertPTF implements PathTransformationFunction<ArrayInsertOperation> {
  transformDescendantPath(ancestor: ArrayInsertOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength = ancestor.path.length;
    var descendantPathIndex = <number>descendantPath[ancestorPathLength];
    if (ancestor.index <= descendantPathIndex) {
      var newPath = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantPathIndex + 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

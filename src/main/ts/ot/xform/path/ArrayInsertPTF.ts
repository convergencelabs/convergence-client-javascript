import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";
import {Path} from "../../Path";

export default class ArrayInsertPTF implements PathTransformationFunction<ArrayInsertOperation> {
  transformDescendantPath(ancestor: ArrayInsertOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength: number = ancestor.path.length;
    var descendantPathIndex: number = <number>descendantPath[ancestorPathLength];
    if (ancestor.index <= descendantPathIndex) {
      var newPath: Path = descendantPath.slice(0);
      newPath[ancestorPathLength] = descendantPathIndex + 1;
      return new PathTransformation(PathTransformationResult.PathUpdated, newPath);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

import {PathTransformationFunction} from "../PathTransformationFunction";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ArrayReplacePTF implements PathTransformationFunction<ArrayReplaceOperation> {
  transformDescendantPath(ancestor: ArrayReplaceOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength: number = ancestor.path.length;
    var descendantArrayIndex: number = <number>descendantPath[ancestorPathLength];

    if (ancestor.index === descendantArrayIndex) {
      return new PathTransformation(PathTransformationResult.PathObsoleted, null);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

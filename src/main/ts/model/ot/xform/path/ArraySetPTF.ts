import {PathTransformationFunction} from "../PathTransformationFunction";
import ArraySetOperation from "../../ops/ArraySetOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ArraySetPTF implements PathTransformationFunction<ArraySetOperation> {
  transformDescendantPath(ancestor: ArraySetOperation, descendantPath: Array<string | number>): PathTransformation {
    return new PathTransformation(PathTransformationResult.PathObsoleted, null);
  }
}

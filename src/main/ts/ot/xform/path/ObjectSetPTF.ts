import {PathTransformationFunction} from "../PathTransformationFunction";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ObjectSetPTF implements PathTransformationFunction<ObjectSetOperation> {
  transformDescendantPath(ancestor: ObjectSetOperation, descendantPath: Array<string | number>): PathTransformation {
    return new PathTransformation(PathTransformationResult.PathObsoleted, null);
  }
}

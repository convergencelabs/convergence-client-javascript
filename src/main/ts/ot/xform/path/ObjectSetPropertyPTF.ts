import {PathTransformationFunction} from "../PathTransformationFunction";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ObjectSetPropertyPTF implements PathTransformationFunction<ObjectSetPropertyOperation> {
  transformDescendantPath(ancestor: ObjectSetPropertyOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength: number = ancestor.path.length;
    var commonProperty: string = <string>descendantPath[ancestorPathLength];

    if (ancestor.prop === commonProperty) {
      return new PathTransformation(PathTransformationResult.PathObsoleted, null);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

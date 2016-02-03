import {PathTransformationFunction} from "../PathTransformationFunction";
import ObjectRemovePropertyOperation from "../../ops/ObjectRemovePropertyOperation";
import {PathTransformation} from "../PathTransformationFunction";
import {PathTransformationResult} from "../PathTransformationFunction";

export default class ObjectRemovePropertyPTF implements PathTransformationFunction<ObjectRemovePropertyOperation> {
  transformDescendantPath(ancestor: ObjectRemovePropertyOperation, descendantPath: Array<string | number>): PathTransformation {
    var ancestorPathLength = ancestor.path.length;
    var commonProperty = descendantPath[ancestorPathLength];

    if (ancestor.prop === commonProperty) {
      return new PathTransformation(PathTransformationResult.PathObsoleted, null);
    } else {
      return new PathTransformation(PathTransformationResult.NoTransformation, null);
    }
  }
}

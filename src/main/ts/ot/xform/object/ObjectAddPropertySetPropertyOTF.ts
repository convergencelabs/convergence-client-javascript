import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import OperationPair from "../OperationPair";

export default class ObjectAddPropertySetPropertyOTF implements OperationTransformationFunction<ObjectAddPropertyOperation, ObjectSetPropertyOperation> {
  transform(s: ObjectAddPropertyOperation, c: ObjectSetPropertyOperation): OperationPair {
    if (s.prop != c.prop) {
      // O-AT-1
      return new OperationPair(s, c);
    } else {
      // O-AT-2
      throw new Error("Add property and set property can not target the same property")
    }
  }
}

import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import OperationPair from "../OperationPair";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";

export default class ObjectSetPropertyAddPropertyOTF
  implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectAddPropertyOperation> {

  transform(s: ObjectSetPropertyOperation, c: ObjectAddPropertyOperation): OperationPair {
    if (s.prop !== c.prop) {
      // O-TA-1
      return new OperationPair(s, c);
    } else {
      // O-TA-2
      throw new Error("Set property and add property can not target the same property");
    }
  }
}

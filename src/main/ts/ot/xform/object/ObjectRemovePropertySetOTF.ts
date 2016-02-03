import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectRemovePropertyOperation from "../../ops/ObjectRemovePropertyOperation";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import OperationPair from "../OperationPair";

export default class ObjectRemovePropertySetOTF
  implements OperationTransformationFunction<ObjectRemovePropertyOperation, ObjectSetOperation> {

  transform(s: ObjectRemovePropertyOperation, c: ObjectSetOperation): OperationPair {
    // O-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import ObjectRemovePropertyOperation from "../../ops/ObjectRemovePropertyOperation";
import OperationPair from "../OperationPair";

export default class ObjectSetRemovePropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectRemovePropertyOperation> {
  transform(s: ObjectSetOperation, c: ObjectRemovePropertyOperation): OperationPair {
    // O-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

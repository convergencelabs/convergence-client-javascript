import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import OperationPair from "../OperationPair";

export default class ObjectSetSetPropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectSetPropertyOperation> {
  transform(s: ObjectSetOperation, c: ObjectSetPropertyOperation): OperationPair {
    // O-ST-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

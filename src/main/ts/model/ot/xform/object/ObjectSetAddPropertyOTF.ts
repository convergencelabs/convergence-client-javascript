import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";
import OperationPair from "../OperationPair";

export default class ObjectSetAddPropertyOTF implements OperationTransformationFunction<ObjectSetOperation, ObjectAddPropertyOperation> {
  transform(s: ObjectSetOperation, c: ObjectAddPropertyOperation): OperationPair {
    // O-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

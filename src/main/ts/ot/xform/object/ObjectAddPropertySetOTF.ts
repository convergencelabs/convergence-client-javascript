import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

export default class ObjectAddPropertySetOTF implements OperationTransformationFunction<ObjectAddPropertyOperation, ObjectSetOperation> {
  transform(s: ObjectAddPropertyOperation, c: ObjectSetOperation): OperationPair {
    // O-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

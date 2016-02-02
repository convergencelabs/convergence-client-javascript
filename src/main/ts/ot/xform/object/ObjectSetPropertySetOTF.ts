import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import ObjectSetOperation from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

export default class ObjectSetPropertySetOTF implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectSetOperation> {
  transform(s: ObjectSetPropertyOperation, c: ObjectSetOperation): OperationPair {
    // O-TS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

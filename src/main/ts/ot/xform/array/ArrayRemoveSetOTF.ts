import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayRemoveOperation from "../../ops/ArrayRemoveOperation";
import ArraySetOperation from "../../ops/ArraySetOperation";

export default class ArrayRemoveSetOTF implements OperationTransformationFunction<ArrayRemoveOperation, ArraySetOperation> {
  transform(s: ArrayRemoveOperation, c: ArraySetOperation): OperationPair {
    // A-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

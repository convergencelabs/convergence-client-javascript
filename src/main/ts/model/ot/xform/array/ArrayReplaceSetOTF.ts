import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";
import ArraySetOperation from "../../ops/ArraySetOperation";

export default class ArrayReplaceSetOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArraySetOperation> {
  transform(s: ArrayReplaceOperation, c: ArraySetOperation): OperationPair {
    // A-PS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

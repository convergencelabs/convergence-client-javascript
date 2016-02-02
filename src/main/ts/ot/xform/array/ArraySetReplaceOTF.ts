import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArraySetOperation from "../../ops/ArraySetOperation";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";

export default class ArraySetReplaceOTF implements OperationTransformationFunction<ArraySetOperation, ArrayReplaceOperation> {
  transform(s: ArraySetOperation, c: ArrayReplaceOperation): OperationPair {
    // A-SP-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

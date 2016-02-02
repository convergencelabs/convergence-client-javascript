import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArraySetOperation from "../../ops/ArraySetOperation";
import ArrayRemoveOperation from "../../ops/ArrayRemoveOperation";

export default class ArraySetRemoveOTF implements OperationTransformationFunction<ArraySetOperation, ArrayRemoveOperation> {
  transform(s: ArraySetOperation, c: ArrayRemoveOperation): OperationPair {
    // A-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

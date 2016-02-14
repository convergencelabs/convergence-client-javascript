import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArraySetOperation from "../../ops/ArraySetOperation";
import ArrayMoveOperation from "../../ops/ArrayMoveOperation";

export default class ArraySetMoveOTF implements OperationTransformationFunction<ArraySetOperation, ArrayMoveOperation> {
  transform(s: ArraySetOperation, c: ArrayMoveOperation): OperationPair {
    // A-SM-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

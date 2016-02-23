import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayMoveOperation from "../../ops/ArrayMoveOperation";
import ArraySetOperation from "../../ops/ArraySetOperation";

export default class ArrayMoveSetOTF implements OperationTransformationFunction<ArrayMoveOperation, ArraySetOperation> {
  transform(s: ArrayMoveOperation, c: ArraySetOperation): OperationPair {
    // A-MS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

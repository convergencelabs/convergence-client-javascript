import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";
import ArraySetOperation from "../../ops/ArraySetOperation";

export default class ArrayInsertSetOTF implements OperationTransformationFunction<ArrayInsertOperation, ArraySetOperation> {
  transform(s: ArrayInsertOperation, c: ArraySetOperation): OperationPair {
    // A-IS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

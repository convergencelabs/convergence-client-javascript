import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArraySetOperation from "../../ops/ArraySetOperation";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";

export default class ArraySetInsertOTF implements OperationTransformationFunction<ArraySetOperation, ArrayInsertOperation> {
  transform(s: ArraySetOperation, c: ArrayInsertOperation): OperationPair {
    // A-SI-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}


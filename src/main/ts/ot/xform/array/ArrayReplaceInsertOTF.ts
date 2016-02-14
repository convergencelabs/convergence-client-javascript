import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";

export default class ArrayReplaceInsertOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArrayInsertOperation> {
  transform(s: ArrayReplaceOperation, c: ArrayInsertOperation): OperationPair {
    if (s.index < c.index) {
      // A-PI-1
      return new OperationPair(s, c);
    } else {
      // A-PI-2 and A-PI-3
      return new OperationPair(s.copy({index: s.index + 1}), c);
    }
  }
}

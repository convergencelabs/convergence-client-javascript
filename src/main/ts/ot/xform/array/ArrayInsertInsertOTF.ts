import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";

export default class ArrayInsertInsertOTF implements OperationTransformationFunction<ArrayInsertOperation, ArrayInsertOperation> {
  transform(s: ArrayInsertOperation, c: ArrayInsertOperation): OperationPair {
    if (s.index <= c.index) {
      // A-II-1 and A-II-2
      return new OperationPair(s, c.copy({index: c.index + 1}));
    } else {
      // A-II-3
      return new OperationPair(s.copy({index: s.index + 1}), c);
    }
  }
}

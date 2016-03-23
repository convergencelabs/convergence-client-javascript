import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";
import ArrayRemoveOperation from "../../ops/ArrayRemoveOperation";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";

export default class ArrayReplaceRemoveOTF implements OperationTransformationFunction<ArrayReplaceOperation, ArrayRemoveOperation> {
  transform(s: ArrayReplaceOperation, c: ArrayRemoveOperation): OperationPair {
    if (s.index < c.index) {
      // A-PR-1
      return new OperationPair(s, c);
    } else if (s.index === c.index) {
      // A-PR-2
      return new OperationPair(
        new ArrayInsertOperation(s.id, s.noOp, s.index, s.value),
        c.copy({noOp: true}));
    } else {
      // A-PR-3
      return new OperationPair(s.copy({index: s.index - 1}), c);
    }
  }
}

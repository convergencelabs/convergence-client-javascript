import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayReplaceRemoveOTF: OperationTransformationFunction<ArrayReplaceOperation, ArrayRemoveOperation> =
  (s: ArrayReplaceOperation, c: ArrayRemoveOperation) => {
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
  };

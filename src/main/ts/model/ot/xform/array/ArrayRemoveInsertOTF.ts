import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayRemoveInsertOTF: OperationTransformationFunction<ArrayRemoveOperation, ArrayInsertOperation> =
  (s: ArrayRemoveOperation, c: ArrayInsertOperation) => {
    if (s.index < c.index) {
      // A-RI-1
      return new OperationPair(s, c.copy({index: c.index - 1}));
    } else {
      // A-RI-2 and A-RI-3
      return new OperationPair(s.copy({index: s.index + 1}), c);
    }
  };

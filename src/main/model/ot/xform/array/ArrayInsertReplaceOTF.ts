import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";

/**
 * @hidden
 * @internal
 */
export const ArrayInsertReplaceOTF: OperationTransformationFunction<ArrayInsertOperation, ArrayReplaceOperation> =
  (s: ArrayInsertOperation, c: ArrayReplaceOperation) => {
    if (s.index <= c.index) {
      // A-IP-1 and A-IP-2
      return new OperationPair(s, c.copy({index: c.index + 1}));
    } else {
      // A-IP-3
      return new OperationPair(s, c);
    }
  };

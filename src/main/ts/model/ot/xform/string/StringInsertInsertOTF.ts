import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringInsertOperation} from "../../ops/StringInsertOperation";

/**
 * @hidden
 * @internal
 */
export const StringInsertInsertOTF: OperationTransformationFunction<StringInsertOperation, StringInsertOperation> =
  (s: StringInsertOperation, c: StringInsertOperation) => {
    if (s.index <= c.index) {
      // S-II-1 and S-II-2
      return new OperationPair(s, c.copy({index: c.index + s.value.length}));
    } else {
      // S-II-3
      return new OperationPair(s.copy({index: s.index + c.value.length}), c);
    }
  };

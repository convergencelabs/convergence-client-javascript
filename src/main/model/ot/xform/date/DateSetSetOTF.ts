import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {DateSetOperation} from "../../ops/DateSetOperation";

/**
 * @hidden
 * @internal
 */
export const DateSetSetOTF: OperationTransformationFunction<DateSetOperation, DateSetOperation> =
  (s: DateSetOperation, c: DateSetOperation) => {
    if (s.value.getTime() === c.value.getTime()) {
      // D-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // D-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  };

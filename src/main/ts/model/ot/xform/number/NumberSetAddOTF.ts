import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberSetOperation} from "../../ops/NumberSetOperation";
import {NumberAddOperation} from "../../ops/NumberAddOperation";

/**
 * @hidden
 * @internal
 */
export const NumberSetAddOTF: OperationTransformationFunction<NumberSetOperation, NumberAddOperation> =
  (s: NumberSetOperation, c: NumberAddOperation) => {
    // N-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  };

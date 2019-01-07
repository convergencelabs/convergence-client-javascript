import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberDeltaOperation} from "../../ops/NumberDeltaOperation";
import {NumberSetOperation} from "../../ops/NumberSetOperation";

/**
 * @hidden
 * @internal
 */
export const NumberAddSetOTF: OperationTransformationFunction<NumberDeltaOperation, NumberSetOperation> =
  (s: NumberDeltaOperation, c: NumberSetOperation) => {
    // N-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberDeltaOperation} from "../../ops/NumberDeltaOperation";

/**
 * @hidden
 * @internal
 */
export const NumberAddAddOTF: OperationTransformationFunction<NumberDeltaOperation, NumberDeltaOperation> =
  (s: NumberDeltaOperation, c: NumberDeltaOperation) => {
    // N-AA-1
    return new OperationPair(s, c);
  };

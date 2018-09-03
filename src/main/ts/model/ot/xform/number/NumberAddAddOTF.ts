import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberAddOperation} from "../../ops/NumberAddOperation";

/**
 * @hidden
 * @internal
 */
export const NumberAddAddOTF: OperationTransformationFunction<NumberAddOperation, NumberAddOperation> =
  (s: NumberAddOperation, c: NumberAddOperation) => {
    // N-AA-1
    return new OperationPair(s, c);
  };

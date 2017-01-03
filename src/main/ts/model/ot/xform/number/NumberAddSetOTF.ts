import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {NumberAddOperation} from "../../ops/NumberAddOperation";
import {NumberSetOperation} from "../../ops/NumberSetOperation";

export const NumberAddSetOTF: OperationTransformationFunction<NumberAddOperation, NumberSetOperation> =
  (s: NumberAddOperation, c: NumberSetOperation) => {
    // N-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

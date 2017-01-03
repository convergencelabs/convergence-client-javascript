import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {BooleanSetOperation} from "../../ops/BooleanSetOperation";

export const BooleanSetSetOTF: OperationTransformationFunction<BooleanSetOperation, BooleanSetOperation> =
  (s: BooleanSetOperation, c: BooleanSetOperation) => {
    if (s.value === c.value) {
      // B-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // B-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  };

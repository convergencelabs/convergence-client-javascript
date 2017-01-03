import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

export const ArrayMoveSetOTF: OperationTransformationFunction<ArrayMoveOperation, ArraySetOperation> =
  (s: ArrayMoveOperation, c: ArraySetOperation) => {
    // A-MS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

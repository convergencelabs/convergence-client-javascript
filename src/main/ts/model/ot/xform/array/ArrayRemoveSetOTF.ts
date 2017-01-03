import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

export const ArrayRemoveSetOTF: OperationTransformationFunction<ArrayRemoveOperation, ArraySetOperation> =
  (s: ArrayRemoveOperation, c: ArraySetOperation) => {
    // A-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

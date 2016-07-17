import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {ArrayMoveOperation} from "../../ops/ArrayMoveOperation";

export var ArraySetMoveOTF: OperationTransformationFunction<ArraySetOperation, ArrayMoveOperation> =
  (s: ArraySetOperation, c: ArrayMoveOperation) => {
    // A-SM-1
    return new OperationPair(s, c.copy({noOp: true}));
  };

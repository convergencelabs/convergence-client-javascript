import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArraySetOperation} from "../../ops/ArraySetOperation";

export var ArrayReplaceSetOTF: OperationTransformationFunction<ArrayReplaceOperation, ArraySetOperation> =
  (s: ArrayReplaceOperation, c: ArraySetOperation) => {
    // A-PS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

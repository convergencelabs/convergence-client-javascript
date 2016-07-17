import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";

export var ArraySetReplaceOTF: OperationTransformationFunction<ArraySetOperation, ArrayReplaceOperation> =
  (s: ArraySetOperation, c: ArrayReplaceOperation) => {
    // A-SP-1
    return new OperationPair(s, c.copy({noOp: true}));
  };

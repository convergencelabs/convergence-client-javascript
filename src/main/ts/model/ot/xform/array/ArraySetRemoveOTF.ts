import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArraySetOperation} from "../../ops/ArraySetOperation";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";

export var ArraySetRemoveOTF: OperationTransformationFunction<ArraySetOperation, ArrayRemoveOperation> =
  (s: ArraySetOperation, c: ArrayRemoveOperation) => {
    // A-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  };

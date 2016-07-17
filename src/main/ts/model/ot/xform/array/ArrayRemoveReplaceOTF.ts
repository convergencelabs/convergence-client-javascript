import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";
import {ArrayReplaceOperation} from "../../ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../../ops/ArrayInsertOperation";

export var ArrayRemoveReplaceOTF: OperationTransformationFunction<ArrayRemoveOperation, ArrayReplaceOperation> =
  (s: ArrayRemoveOperation, c: ArrayReplaceOperation) => {
    if (s.index < c.index) {
      // A-RP-1
      return new OperationPair(s, c.copy({index: c.index - 1}));
    } else if (s.index === c.index) {
      // A-RP-2
      return new OperationPair(s.copy({noOp: true}), new ArrayInsertOperation(
        c.id, c.noOp, c.index, c.value));
    } else {
      // A-RP-3
      return new OperationPair(s, c);
    }
  };

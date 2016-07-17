import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {OperationPair} from "../OperationPair";
import {ArrayRemoveOperation} from "../../ops/ArrayRemoveOperation";

export var ArrayRemoveRemoveOTF: OperationTransformationFunction<ArrayRemoveOperation, ArrayRemoveOperation> =
  (s: ArrayRemoveOperation, c: ArrayRemoveOperation) => {
    if (s.index === c.index) {
      // A-RR-2
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    } else if (s.index < c.index) {
      // A-RR-1
      return new OperationPair(s, c.copy({index: c.index - 1}));
    } else {
      // A-RR-3
      return new OperationPair(s.copy({index: s.index - 1}), c);
    }
  };

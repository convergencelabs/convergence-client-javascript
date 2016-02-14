import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArraySetOperation from "../../ops/ArraySetOperation";
import EqualsUtil from "../../../util/EqualsUtil";

export default class ArraySetSetOTF implements OperationTransformationFunction<ArraySetOperation, ArraySetOperation> {
  transform(s: ArraySetOperation, c: ArraySetOperation): OperationPair {
    if (!EqualsUtil.deepEquals(s.value, c.value)) {
      // A-SS-1
      return new OperationPair(s, c.copy({noOp: true}));
    } else {
      // A-SS-2
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    }
  }

}

import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import BooleanSetOperation from "../../ops/BooleanSetOperation";

export default class BooleanSetSetOTF implements OperationTransformationFunction<BooleanSetOperation, BooleanSetOperation> {
  transform(s: BooleanSetOperation, c: BooleanSetOperation): OperationPair {
    if (s.value == c.value) {
      // B-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // B-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

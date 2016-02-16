import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import NumberAddOperation from "../../ops/NumberAddOperation";
import NumberSetOperation from "../../ops/NumberSetOperation";

export default class NumberAddSetOTF implements OperationTransformationFunction<NumberAddOperation, NumberSetOperation> {
  transform(s: NumberAddOperation, c: NumberSetOperation): OperationPair {
    // N-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

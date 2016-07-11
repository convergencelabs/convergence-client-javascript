import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import NumberSetOperation from "../../ops/NumberSetOperation";
import NumberAddOperation from "../../ops/NumberAddOperation";

export default class NumberSetAddOTF implements OperationTransformationFunction<NumberSetOperation, NumberAddOperation> {
  transform(s: NumberSetOperation, c: NumberAddOperation): OperationPair {
    // N-SA-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

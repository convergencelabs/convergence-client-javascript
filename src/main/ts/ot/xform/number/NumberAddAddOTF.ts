import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import NumberAddOperation from "../../ops/NumberAddOperation";

export default class NumberAddAddOTF implements OperationTransformationFunction<NumberAddOperation, NumberAddOperation> {
  transform(s: NumberAddOperation, c: NumberAddOperation): OperationPair {
    // N-AA-1
    return new OperationPair(s, c);
  }
}

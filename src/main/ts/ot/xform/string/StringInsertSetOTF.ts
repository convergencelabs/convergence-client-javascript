import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringInsertOperation from "../../ops/StringInsertOperation";
import StringSetOperation from "../../ops/StringSetOperation";

export default class StringInsertSetOTF implements OperationTransformationFunction<StringInsertOperation, StringSetOperation> {
  transform(s: StringInsertOperation, c: StringSetOperation): OperationPair {
    // S-IS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

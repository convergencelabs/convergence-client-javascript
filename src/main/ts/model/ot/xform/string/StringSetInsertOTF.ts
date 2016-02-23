import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringSetOperation from "../../ops/StringSetOperation";
import StringInsertOperation from "../../ops/StringInsertOperation";

export default class StringSetInsertOTF implements OperationTransformationFunction<StringSetOperation, StringInsertOperation> {
  transform(s: StringSetOperation, c: StringInsertOperation): OperationPair {
    // S-SI-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

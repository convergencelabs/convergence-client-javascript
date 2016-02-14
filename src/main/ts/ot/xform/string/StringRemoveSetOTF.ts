import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringRemoveOperation from "../../ops/StringRemoveOperation";
import StringSetOperation from "../../ops/StringSetOperation";

export default class StringRemoveSetOTF implements OperationTransformationFunction<StringRemoveOperation, StringSetOperation> {
  transform(s: StringRemoveOperation, c: StringSetOperation): OperationPair {
    // S-RS-1
    return new OperationPair(s.copy({noOp: true}), c);
  }
}

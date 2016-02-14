import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringSetOperation from "../../ops/StringSetOperation";
import StringRemoveOperation from "../../ops/StringRemoveOperation";

export default class StringSetRemoveOTF implements OperationTransformationFunction<StringSetOperation, StringRemoveOperation> {
  transform(s: StringSetOperation, c: StringRemoveOperation): OperationPair {
    // S-SR-1
    return new OperationPair(s, c.copy({noOp: true}));
  }
}

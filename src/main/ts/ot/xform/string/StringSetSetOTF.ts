import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringSetOperation from "../../ops/StringSetOperation";

export default class StringSetSetOTF implements OperationTransformationFunction<StringSetOperation, StringSetOperation> {
  transform(s: StringSetOperation, c: StringSetOperation): OperationPair {
    if (s.value === c.value) {
      // S-SS-1
      return new OperationPair(s.copy({noOp: true}), s.copy({noOp: true}));
    } else {
      // S-SS-2
      return new OperationPair(s, c.copy({noOp: true}));
    }
  }
}

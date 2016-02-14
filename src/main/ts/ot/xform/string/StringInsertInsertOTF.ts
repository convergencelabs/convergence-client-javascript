import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringInsertOperation from "../../ops/StringInsertOperation";

export default class StringInsertInsertOTF implements OperationTransformationFunction<StringInsertOperation, StringInsertOperation> {
  transform(s: StringInsertOperation, c: StringInsertOperation): OperationPair {
    if (s.index <= c.index) {
      // S-II-1 and S-II-2
      return new OperationPair(s, c.copy({index: c.index + s.value.length}));
    } else {
      // S-II-3
      return new OperationPair(s.copy({index: s.index + c.value.length}), c);
    }
  }
}

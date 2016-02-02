import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringInsertOperation from "../../ops/StringInsertOperation";
import StringRemoveOperation from "../../ops/StringRemoveOperation";

export default class StringInsertRemoveOTF implements OperationTransformationFunction<StringInsertOperation, StringRemoveOperation> {
  transform(s: StringInsertOperation, c: StringRemoveOperation): OperationPair {
    if (s.index <= c.index) {
      // S-IR-1 and S-IR-2
      return new OperationPair(s, c.copy({index: c.index + s.value.length}));
    } else if (s.index >= c.index + c.value.length) {
      // S-IR-5
      return new OperationPair(s.copy({index: s.index - c.value.length}), c);
    } else {
      // S-IR-3 and S-IR-4
      var offsetDelta = s.index - c.index;
      return new OperationPair(s.copy({noOp: true}), c.copy(
        {
          value: c.value.substring(0, offsetDelta) +
          s.value +
          c.value.substring(offsetDelta, c.value.length)
        }));
    }
  }
}

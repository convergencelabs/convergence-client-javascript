import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {StringInsertOperation} from "../../ops/StringInsertOperation";

export var StringRemoveInsertOTF: OperationTransformationFunction<StringRemoveOperation, StringInsertOperation> =
  (s: StringRemoveOperation, c: StringInsertOperation) => {
    if (c.index <= s.index) {
      // S-RI-1 and S-RI-2
      return new OperationPair(s.copy({index: s.index + c.value.length}), c);
    } else if (c.index >= s.index + s.value.length) {
      // S-RI-5
      return new OperationPair(s, c.copy({index: c.index - s.value.length}));
    } else {
      // S-RI-3 and S-RI-4
      const offsetDelta: number = c.index - s.index;
      return new OperationPair(
        s.copy({
          value: s.value.substring(0, offsetDelta) +
          c.value +
          s.value.substring(offsetDelta, s.value.length)
        }),
        c.copy({noOp: true}));
    }
  };

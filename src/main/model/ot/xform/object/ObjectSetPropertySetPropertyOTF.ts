import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetPropertySetPropertyOTF: OperationTransformationFunction<ObjectSetPropertyOperation,
  ObjectSetPropertyOperation> =
  (s: ObjectSetPropertyOperation, c: ObjectSetPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-TT-1
      return new OperationPair(s, c);
    } else if (s.value !== c.value) {
      // O-TT-2
      return new OperationPair(s, c.copy({ noOp: true }));
    } else {
      // O-TT-3
      return new OperationPair(s.copy({ noOp: true }), c.copy({ noOp: true }));
    }
  };

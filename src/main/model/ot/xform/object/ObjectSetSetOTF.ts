import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";
import {EqualsUtil} from "../../../../util/EqualsUtil";

/**
 * @hidden
 * @internal
 */
export const ObjectSetSetOTF: OperationTransformationFunction<ObjectSetOperation, ObjectSetOperation> =
  (s: ObjectSetOperation, c: ObjectSetOperation) => {
    if (!EqualsUtil.deepEquals(s.value, c.value)) {
      // O-SS-1
      return new OperationPair(s, c.copy({noOp: true}));
    } else {
      // O-SS-2
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    }
  };

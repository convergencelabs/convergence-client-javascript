import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectSetPropertySetOTF: OperationTransformationFunction<ObjectSetPropertyOperation, ObjectSetOperation> =
  (s: ObjectSetPropertyOperation, c: ObjectSetOperation) => {
    // O-TS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

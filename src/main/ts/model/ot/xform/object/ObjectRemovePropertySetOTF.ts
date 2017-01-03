import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

export const ObjectRemovePropertySetOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectSetOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectSetOperation) => {
    // O-RS-1
    return new OperationPair(s.copy({ noOp: true }), c);
  };

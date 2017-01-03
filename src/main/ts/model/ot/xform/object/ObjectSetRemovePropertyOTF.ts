import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {OperationPair} from "../OperationPair";

export const ObjectSetRemovePropertyOTF: OperationTransformationFunction<ObjectSetOperation,
  ObjectRemovePropertyOperation> =
  (s: ObjectSetOperation, c: ObjectRemovePropertyOperation) => {
    // O-SR-1
    return new OperationPair(s, c.copy({ noOp: true }));
  };

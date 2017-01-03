import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";

export const ObjectSetSetPropertyOTF: OperationTransformationFunction<ObjectSetOperation, ObjectSetPropertyOperation> =
  (s: ObjectSetOperation, c: ObjectSetPropertyOperation) => {
    // O-ST-1
    return new OperationPair(s, c.copy({noOp: true}));
  };

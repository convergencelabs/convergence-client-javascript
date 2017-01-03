import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {ObjectSetOperation} from "../../ops/ObjectSetOperation";
import {OperationPair} from "../OperationPair";

export const ObjectAddPropertySetOTF: OperationTransformationFunction<ObjectAddPropertyOperation, ObjectSetOperation> =
  (s: ObjectAddPropertyOperation, c: ObjectSetOperation) => {
    // O-AS-1
    return new OperationPair(s.copy({noOp: true}), c);
  };

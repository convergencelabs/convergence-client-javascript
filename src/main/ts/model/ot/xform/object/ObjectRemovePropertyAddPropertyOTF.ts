import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {OperationPair} from "../OperationPair";

export const ObjectRemovePropertyAddPropertyOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectAddPropertyOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectAddPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-RA-1
      return new OperationPair(s, c);
    } else {
      // O-RA-2
      throw new Error("Remove property and add property can not target the same property");
    }
  };

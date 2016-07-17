import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {OperationPair} from "../OperationPair";

export var ObjectAddPropertyRemovePropertyOTF: OperationTransformationFunction<ObjectAddPropertyOperation, ObjectRemovePropertyOperation> =
  (s: ObjectAddPropertyOperation, c: ObjectRemovePropertyOperation) => {
  if (s.prop !== c.prop) {
    // O-AR-1
    return new OperationPair(s, c);
  } else {
    // O-AR-2
    throw new Error("Add property and Remove property can not target the same property");
  }
};

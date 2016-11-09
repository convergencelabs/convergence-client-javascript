import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {ObjectSetPropertyOperation} from "../../ops/ObjectSetPropertyOperation";
import {OperationPair} from "../OperationPair";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";

export var ObjectRemovePropertySetPropertyOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectSetPropertyOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectSetPropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-RT-1
      return new OperationPair(s, c);
    } else {
      // O-RT-2
      return new OperationPair(
        s.copy({ noOp: true }),
        new ObjectAddPropertyOperation(c.id, c.noOp, c.prop, c.value));
    }
  };

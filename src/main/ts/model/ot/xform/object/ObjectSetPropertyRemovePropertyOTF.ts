import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";
import ObjectRemovePropertyOperation from "../../ops/ObjectRemovePropertyOperation";
import OperationPair from "../OperationPair";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";

export default class ObjectSetPropertyRemovePropertyOTF
  implements OperationTransformationFunction<ObjectSetPropertyOperation, ObjectRemovePropertyOperation> {

  transform(s: ObjectSetPropertyOperation, c: ObjectRemovePropertyOperation): OperationPair {
    if (s.prop !== c.prop) {
      // O-TR-1
      return new OperationPair(s, c);
    } else {
      // O-TR-2
      return new OperationPair(
        new ObjectAddPropertyOperation(s.id, s.noOp, s.prop, s.value),
        c.copy({noOp: true}));
    }
  }
}

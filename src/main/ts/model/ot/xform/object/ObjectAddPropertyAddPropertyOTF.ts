import OperationTransformationFunction from "../OperationTransformationFunction";
import ObjectAddPropertyOperation from "../../ops/ObjectAddPropertyOperation";
import OperationPair from "../OperationPair";
import ObjectSetPropertyOperation from "../../ops/ObjectSetPropertyOperation";

export default class ObjectAddPropertyAddPropertyOTF
  implements OperationTransformationFunction<ObjectAddPropertyOperation, ObjectAddPropertyOperation> {

  transform(s: ObjectAddPropertyOperation, c: ObjectAddPropertyOperation): OperationPair {
    if (s.prop !== c.prop) {
      // O-AA-1
      return new OperationPair(s, c);
    } else if (s.value !== c.value) {
      // O-AA-2
      return new OperationPair(
        new ObjectSetPropertyOperation(s.id, s.noOp, s.prop, s.value),
        c.copy({noOp: true}));
    } else {
      // O-AA-3
      return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
    }
  }
}

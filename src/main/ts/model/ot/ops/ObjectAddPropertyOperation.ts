import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../../connection/protocol/model/OperationType";

export default class ObjectAddPropertyOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public prop: string, public value: any) {
    super(OperationType.OBJECT_ADD, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

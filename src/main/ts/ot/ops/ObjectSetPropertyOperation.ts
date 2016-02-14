import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class ObjectSetPropertyOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public prop: string, public value: any) {
    super(OperationType.OBJECT_SET, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

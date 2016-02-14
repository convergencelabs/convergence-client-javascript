import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class BooleanSetOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public value: boolean) {
    super(OperationType.BOOLEAN_VALUE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): BooleanSetOperation {
    return new BooleanSetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

import DiscreteOperation from "./DiscreteOperation";
import Immutable from "../../../util/Immutable";
import {Path} from "../Path";
import {OperationType} from "./OperationType";

export default class StringSetOperation extends DiscreteOperation {

  constructor(path: Path, public noOp: boolean, public value: string) {
    super(OperationType.STRING_VALUE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringSetOperation {
    return new StringSetOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


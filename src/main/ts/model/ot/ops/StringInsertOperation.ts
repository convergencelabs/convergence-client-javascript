import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import {OperationType} from "./OperationType";

export default class StringInsertOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public index: number, public value: string) {
    super(OperationType.STRING_INSERT, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringInsertOperation {
    return new StringInsertOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

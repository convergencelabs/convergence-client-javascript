import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../../connection/protocol/model/OperationType";

export default class StringRemoveOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public index: number, public value: string) {
    super(OperationType.STRING_REMOVE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringRemoveOperation {
    return new StringRemoveOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

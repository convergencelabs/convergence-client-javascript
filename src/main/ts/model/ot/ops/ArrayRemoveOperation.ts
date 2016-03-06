import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import {OperationType} from "./OperationType";

export default class ArrayRemoveOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public index: number) {
    super(OperationType.ARRAY_REMOVE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayRemoveOperation {
    return new ArrayRemoveOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index));
  }
}

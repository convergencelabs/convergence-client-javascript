import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class ArrayMoveOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public fromIndex: number, public toIndex: number) {
    super(OperationType.ARRAY_MOVE, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayMoveOperation {
    return new ArrayMoveOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.fromIndex, updates.fromIndex),
      Immutable.update(this.toIndex, updates.toIndex));
  }
}

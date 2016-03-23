import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import {OperationType} from "./OperationType";

export default class ArrayMoveOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public fromIndex: number, public toIndex: number) {
    super(OperationType.ARRAY_REORDER, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayMoveOperation {
    return new ArrayMoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.fromIndex, updates.fromIndex),
      Immutable.update(this.toIndex, updates.toIndex));
  }
}

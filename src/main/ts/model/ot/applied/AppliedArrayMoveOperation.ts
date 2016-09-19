import {ArrayMoveOperation} from "../ops/ArrayMoveOperation";
import {AppliedOperation} from "./AppliedOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedArrayMoveOperation extends ArrayMoveOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, fromIndex: number, toIndex: number) {
    super(id, noOp, fromIndex, toIndex);
    Object.freeze(this);
  }

  copy(updates: any): AppliedArrayMoveOperation {
    return new AppliedArrayMoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.fromIndex, updates.fromIndex),
      Immutable.update(this.toIndex, updates.toIndex));
  }

  inverse(): AppliedArrayMoveOperation {
    return new AppliedArrayMoveOperation(this.id, this.noOp, this.toIndex, this.fromIndex);
  }
}

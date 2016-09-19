import {StringInsertOperation} from "../ops/StringInsertOperation";
import {AppliedOperation} from "./AppliedOperation";
import {AppliedStringRemoveOperation} from "./AppliedStringRemoveOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedStringInsertOperation extends StringInsertOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, index: number, value: string) {
    super(id, noOp, index, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedStringInsertOperation {
    return new AppliedStringInsertOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }

  inverse(): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

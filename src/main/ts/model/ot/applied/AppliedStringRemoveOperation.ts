import {StringRemoveOperation} from "../ops/StringRemoveOperation";
import {AppliedStringInsertOperation} from "./AppliedStringInsertOperation";
import {AppliedOperation} from "./AppliedOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedStringRemoveOperation extends StringRemoveOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, index: number, value: string) {
    super(id, noOp, index, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedStringRemoveOperation {
    return new AppliedStringRemoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }

  inverse(): AppliedStringInsertOperation {
    return new AppliedStringInsertOperation(this.id, this.noOp, this.index, this.value);
  }
}

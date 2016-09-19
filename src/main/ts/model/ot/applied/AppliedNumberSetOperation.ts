import {Immutable} from "../../../util/Immutable";
import {NumberSetOperation} from "../ops/NumberSetOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedNumberSetOperation extends NumberSetOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, value: number, public oldValue: number) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedNumberSetOperation {
    return new AppliedNumberSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedNumberSetOperation {
    return new AppliedNumberSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

import {NumberAddOperation} from "../ops/NumberAddOperation";
import {AppliedOperation} from "./AppliedOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedNumberAddOperation extends NumberAddOperation implements AppliedOperation {

  protected _value: number;

  constructor(id: string, noOp: boolean, value: number) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedNumberAddOperation {
    return new AppliedNumberAddOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }

  inverse(): AppliedNumberAddOperation {
    return new AppliedNumberAddOperation(this.id, this.noOp, -this.value);
  }
}


import {Immutable} from "../../../util/Immutable";
import {BooleanSetOperation} from "../ops/BooleanSetOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedBooleanSetOperation extends BooleanSetOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, value: boolean, public oldValue: boolean) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedBooleanSetOperation {
    return new AppliedBooleanSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedBooleanSetOperation {
    return new AppliedBooleanSetOperation(this.id, this.noOp, this.oldValue,  this.value);
  }
}

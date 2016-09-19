import {Immutable} from "../../../util/Immutable";
import {StringSetOperation} from "../ops/StringSetOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedStringSetOperation extends StringSetOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, value: string, public oldValue: string) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedStringSetOperation {
    return new AppliedStringSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedStringSetOperation {
    return new AppliedStringSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}


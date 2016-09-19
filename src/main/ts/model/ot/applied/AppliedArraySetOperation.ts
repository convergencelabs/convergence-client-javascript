import {Immutable} from "../../../util/Immutable";
import {DataValue} from "../../dataValue";
import {ArraySetOperation} from "../ops/ArraySetOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedArraySetOperation extends ArraySetOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, value: DataValue[], public oldValue: DataValue[]) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedArraySetOperation {
    return new AppliedArraySetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedArraySetOperation {
    return new AppliedArraySetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}


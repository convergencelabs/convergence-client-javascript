import {Immutable} from "../../../util/Immutable";
import {DataValue} from "../../dataValue";
import {ArrayReplaceOperation} from "../ops/ArrayReplaceOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedArrayReplaceOperation extends ArrayReplaceOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, index: number, value: DataValue, public oldValue: DataValue) {
    super(id, noOp, index, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedArrayReplaceOperation {
    return new AppliedArrayReplaceOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedArrayReplaceOperation {
    return new AppliedArrayReplaceOperation(this.id, this.noOp, this.index, this.oldValue, this.value);
  }
}

import {Immutable} from "../../../util/Immutable";
import {ArrayRemoveOperation} from "../ops/ArrayRemoveOperation";
import {DataValue} from "../../dataValue";
import {AppliedOperation} from "./AppliedOperation";
import {AppliedArrayInsertOperation} from "./AppliedArrayInsertOperation";

export class AppliedArrayRemoveOperation extends ArrayRemoveOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, index: number, public oldValue: DataValue) {
    super(id, noOp, index);
    Object.freeze(this);
  }

  copy(updates: any): AppliedArrayRemoveOperation {
    return new AppliedArrayRemoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedArrayInsertOperation {
    return new AppliedArrayInsertOperation(this.id, this.noOp, this.index, this.oldValue);
  }
}

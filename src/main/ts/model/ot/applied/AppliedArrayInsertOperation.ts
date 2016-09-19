import {DataValue} from "../../dataValue";
import {ArrayInsertOperation} from "../ops/ArrayInsertOperation";
import {AppliedOperation} from "./AppliedOperation";
import {AppliedArrayRemoveOperation} from "./AppliedArrayRemoveOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedArrayInsertOperation extends ArrayInsertOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, index: number, value: DataValue) {
    super(id, noOp, index, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedArrayInsertOperation {
    return new AppliedArrayInsertOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }

  inverse(): AppliedArrayRemoveOperation {
    return new AppliedArrayRemoveOperation(this.id, this.noOp, this.index, this.value);
  }
}

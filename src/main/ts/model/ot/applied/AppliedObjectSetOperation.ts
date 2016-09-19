import {Immutable} from "../../../util/Immutable";
import {DataValue} from "../../dataValue";
import {ObjectSetOperation} from "../ops/ObjectSetOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedObjectSetOperation extends ObjectSetOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, value: {[key: string]: DataValue}, public oldValue: {[key: string]: DataValue}) {
    super(id, noOp, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedObjectSetOperation {
    return new AppliedObjectSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedObjectSetOperation {
    return new AppliedObjectSetOperation(this.id, this.noOp, this.oldValue, this.value);
  }
}

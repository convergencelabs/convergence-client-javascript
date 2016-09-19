import {Immutable} from "../../../util/Immutable";
import {DataValue} from "../../dataValue";
import {ObjectSetPropertyOperation} from "../ops/ObjectSetPropertyOperation";
import {AppliedOperation} from "./AppliedOperation";

export class AppliedObjectSetPropertyOperation extends ObjectSetPropertyOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, prop: string, value: DataValue, public oldValue: DataValue) {
    super(id, noOp, prop, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedObjectSetPropertyOperation {
    return new AppliedObjectSetPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedObjectSetPropertyOperation {
    return new AppliedObjectSetPropertyOperation(this.id, this.noOp, this.prop, this.oldValue, this.value);
  }
}

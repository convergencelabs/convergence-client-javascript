import {DataValue} from "../../dataValue";
import {ObjectAddPropertyOperation} from "../ops/ObjectAddPropertyOperation";
import {AppliedOperation} from "./AppliedOperation";
import {AppliedObjectRemovePropertyOperation} from "./AppliedObjectRemovePropertyOperation";
import {Immutable} from "../../../util/Immutable";

export class AppliedObjectAddPropertyOperation extends ObjectAddPropertyOperation implements AppliedOperation {

  constructor(id: string, noOp: boolean, prop: string, value: DataValue) {
    super(id, noOp, prop, value);
    Object.freeze(this);
  }

  copy(updates: any): AppliedObjectAddPropertyOperation {
    return new AppliedObjectAddPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }

  inverse(): AppliedObjectRemovePropertyOperation {
    return new AppliedObjectRemovePropertyOperation(this.id, this.noOp, this.prop, this.value);
  }
}

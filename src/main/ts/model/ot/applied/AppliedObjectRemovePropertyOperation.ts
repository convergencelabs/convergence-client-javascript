import {Immutable} from "../../../util/Immutable";
import {ObjectRemovePropertyOperation} from "../ops/ObjectRemovePropertyOperation";
import {DataValue} from "../../dataValue";
import {AppliedOperation} from "./AppliedOperation";
import {AppliedObjectAddPropertyOperation} from "./AppliedObjectAddPropertyOperation";

export class AppliedObjectRemovePropertyOperation extends ObjectRemovePropertyOperation implements AppliedOperation {

  protected _prop: string;

  constructor(id: string, noOp: boolean, prop: string, public oldValue: DataValue) {
    super(id, noOp, prop);
    Object.freeze(this);
  }

  copy(updates: any): AppliedObjectRemovePropertyOperation {
    return new AppliedObjectRemovePropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.oldValue, updates.oldValue));
  }

  inverse(): AppliedObjectAddPropertyOperation {
    return new AppliedObjectAddPropertyOperation(this.id, this.noOp, this.prop, this.oldValue);
  }
}


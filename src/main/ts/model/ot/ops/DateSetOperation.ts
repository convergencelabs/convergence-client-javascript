import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DateSet} from "./operationChanges";

export class DateSetOperation extends DiscreteOperation implements DateSet {

  constructor(id: string, noOp: boolean, public value: Date) {
    super(OperationType.DATE_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): DateSetOperation {
    return new DateSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";

export class NumberSetOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public value: number) {
    super(OperationType.NUMBER_VALUE, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): NumberSetOperation {
    return new NumberSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}

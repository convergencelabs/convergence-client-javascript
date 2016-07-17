import {DiscreteOperation} from "./DiscreteOperation";
import {Immutable} from "../../../util/Immutable";
import {OperationType} from "./OperationType";

export class StringSetOperation extends DiscreteOperation {

  constructor(id: string, public noOp: boolean, public value: string) {
    super(OperationType.STRING_VALUE, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringSetOperation {
    return new StringSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


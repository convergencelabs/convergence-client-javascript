import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {NumberAdd} from "./operationChanges";

export class NumberAddOperation extends DiscreteOperation implements NumberAdd {

  protected _value: number;

  constructor(id: string, noOp: boolean, public value: number) {
    super(OperationType.NUMBER_ADD, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): NumberAddOperation {
    return new NumberAddOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


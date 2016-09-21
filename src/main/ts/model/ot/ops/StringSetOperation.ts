import {DiscreteOperation} from "./DiscreteOperation";
import {Immutable} from "../../../util/Immutable";
import {OperationType} from "./OperationType";
import {StringSet} from "./operationChanges";

export class StringSetOperation extends DiscreteOperation implements StringSet {

  constructor(id: string, noOp: boolean, public value: string) {
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


import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";

export class StringRemoveOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public index: number, public value: string) {
    super(OperationType.STRING_REMOVE, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): StringRemoveOperation {
    return new StringRemoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

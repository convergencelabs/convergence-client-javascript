import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";

export default class ArrayReplaceOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public index: number, public value: DataValue) {
    super(OperationType.ARRAY_SET, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayReplaceOperation {
    return new ArrayReplaceOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}

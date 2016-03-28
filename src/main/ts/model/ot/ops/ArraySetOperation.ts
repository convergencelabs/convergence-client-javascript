import Immutable from "../../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";

export default class ArraySetOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public value: DataValue[]) {
    super(OperationType.ARRAY_VALUE, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArraySetOperation {
    return new ArraySetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}


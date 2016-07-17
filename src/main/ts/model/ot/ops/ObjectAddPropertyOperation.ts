import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";

export class ObjectAddPropertyOperation extends DiscreteOperation {

  constructor(id: string, noOp: boolean, public prop: string, public value: DataValue) {
    super(OperationType.OBJECT_ADD, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectAddPropertyOperation {
    return new ObjectAddPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

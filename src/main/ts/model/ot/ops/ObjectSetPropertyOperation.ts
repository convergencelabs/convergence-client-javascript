import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DataValue} from "../../dataValue";
import {ObjectSetProperty} from "./operationChanges";

export class ObjectSetPropertyOperation extends DiscreteOperation implements ObjectSetProperty {

  constructor(id: string, noOp: boolean, public prop: string, public value: DataValue) {
    super(OperationType.OBJECT_SET, id, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ObjectSetPropertyOperation {
    return new ObjectSetPropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop),
      Immutable.update(this.value, updates.value));
  }
}

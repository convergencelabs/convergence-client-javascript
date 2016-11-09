import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {ObjectRemoveProperty} from "./operationChanges";

export class ObjectRemovePropertyOperation extends DiscreteOperation implements ObjectRemoveProperty {

  protected _prop: string;

  constructor(id: string, noOp: boolean, public prop: string) {
    super(OperationType.OBJECT_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): ObjectRemovePropertyOperation {
    return new ObjectRemovePropertyOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.prop, updates.prop));
  }
}
